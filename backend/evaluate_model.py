"""
Model Evaluation Script — MetaMusic Tagger
===========================================
Compares Robert's embedded metadata (golden standard) against
our Essentia + Gemini pipeline output.

Golden standard available from MP3 metadata:
  - Genre   → TCON tag  (e.g. "Jazz", "Country Pop", "Electronic Instrumental")
  - BPM     → TBPM tag  (numeric)
  - Vocals  → inferred from USLT (lyrics present = vocal track)

All other Disco categories (instruments, mood, lyricThemes, soundsLike)
are model-only outputs — they are not stored in the MP3 files.

Usage:
    # Sniff metadata fields from a single file:
    python evaluate_model.py sniff /path/to/file.mp3

    # Run full evaluation on a folder:
    python evaluate_model.py eval ./eval_audio_files --gemini-key YOUR_KEY

    # Or set GEMINI_API_KEY env var:
    export GEMINI_API_KEY=your_key
    python evaluate_model.py eval ./eval_audio_files
"""

import argparse
import json
import os
import re
import sys
import warnings

warnings.filterwarnings("ignore")

import pandas as pd

AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aiff", ".aif"}

# Disco tempo vocabulary mapped from BPM ranges (matches our pipeline logic)
def _bpm_to_disco_tempo(bpm: float) -> str:
    if bpm < 70:
        return "Slow"
    if bpm < 90:
        return "Downtempo"
    if bpm < 110:
        return "Midtempo"
    if bpm < 140:
        return "Up-tempo"
    return "Fast"


# ---------------------------------------------------------------------------
# Sniff helper
# ---------------------------------------------------------------------------

def sniff_file(path: str):
    """Print all metadata fields found in an audio file."""
    try:
        from mutagen import File as MutagenFile
    except ImportError:
        print("ERROR: mutagen not installed. Run: pip install mutagen")
        sys.exit(1)

    audio = MutagenFile(path, easy=False)
    if audio is None:
        print(f"Could not parse: {path}")
        return

    print(f"\n{'='*60}")
    print(f"File: {os.path.basename(path)}")
    print(f"Format: {type(audio).__name__}")
    print(f"{'='*60}")

    if not audio.tags:
        print("  No tags found.")
        return

    for key, val in sorted(audio.tags.items()):
        print(f"  {key:<35} = {str(val)[:120]}")


# ---------------------------------------------------------------------------
# Golden standard extraction
# ---------------------------------------------------------------------------

def extract_golden(audio_path: str) -> dict:
    """
    Extract what we can use as golden standard from embedded MP3 metadata:
      genre  → TCON
      bpm    → TBPM (numeric)
      tempo  → derived from TBPM
      vocals → inferred from USLT (lyrics tag)
    """
    try:
        from mutagen import File as MutagenFile
    except ImportError:
        print("ERROR: mutagen not installed. Run: pip install mutagen")
        sys.exit(1)

    audio = MutagenFile(audio_path, easy=False)
    result = {"genre": "", "bpm": None, "tempo": "", "vocals": "", "has_lyrics": False}

    if not audio or not audio.tags:
        return result

    tags = audio.tags

    # Genre
    if "TCON" in tags:
        result["genre"] = str(tags["TCON"]).strip()

    # BPM
    if "TBPM" in tags:
        try:
            result["bpm"] = float(str(tags["TBPM"]).strip())
            result["tempo"] = _bpm_to_disco_tempo(result["bpm"])
        except ValueError:
            pass

    # Vocals — infer from lyrics tag presence
    uslt_keys = [k for k in tags.keys() if k.startswith("USLT")]
    if uslt_keys:
        lyrics_text = str(tags[uslt_keys[0]]).strip()
        if lyrics_text:
            result["has_lyrics"] = True
            result["vocals"] = "Has lyrics (vocal track)"
        else:
            result["vocals"] = "No lyrics tag (likely instrumental)"
    else:
        result["vocals"] = "No lyrics tag (likely instrumental)"

    return result


# ---------------------------------------------------------------------------
# Model pipeline
# ---------------------------------------------------------------------------

def run_model_pipeline(audio_path: str, gemini_key: str) -> tuple[dict, dict]:
    """
    Run Essentia + Gemini. Returns (audio_context, predicted_tags).
    """
    from metamusic_tagger import MetaMusicTagger
    from api import _call_gemini, _validate_tags

    tagger = MetaMusicTagger()
    audio_context = tagger.tag_file(audio_path)
    raw_tags = _call_gemini(audio_context, gemini_key)
    raw_tags.pop("reasoning", None)
    tags = _validate_tags(raw_tags)
    return audio_context, tags


# ---------------------------------------------------------------------------
# Evaluation runner
# ---------------------------------------------------------------------------

def run_evaluation(folder: str, gemini_key: str, output_path: str):
    files = sorted([
        f for f in os.listdir(folder)
        if os.path.splitext(f)[1].lower() in AUDIO_EXTENSIONS
    ])

    if not files:
        print(f"No audio files found in: {folder}")
        sys.exit(1)

    # Deduplicate by name (handles "Cycle of Action" and "Cycle of Action (1)")
    print(f"\nEvaluating {len(files)} files from: {folder}")
    print("=" * 60)

    rows = []
    for i, fname in enumerate(files, 1):
        path = os.path.join(folder, fname)
        print(f"\n[{i}/{len(files)}] {fname}")

        # Golden standard from metadata
        print("  → extracting embedded metadata (golden standard)...")
        golden = extract_golden(path)

        # Model pipeline
        print("  → running Essentia + Gemini pipeline...")
        try:
            audio_context, predicted = run_model_pipeline(path, gemini_key)
        except Exception as e:
            print(f"  ✗ Pipeline error: {e}")
            audio_context, predicted = {}, {}

        # Build comparison row
        row = {
            "filename":         fname,
            # --- Genre comparison ---
            "golden_genre":     golden["genre"],
            "model_genre":      ", ".join(predicted.get("genre", [])),
            # --- Tempo / BPM comparison ---
            "golden_bpm":       golden["bpm"] if golden["bpm"] else "—",
            "golden_tempo":     golden["tempo"],
            "essentia_bpm":     round(audio_context.get("bpm", 0), 1) if audio_context else "—",
            "model_tempo":      predicted.get("tempo", ""),
            # --- Vocals comparison ---
            "golden_vocals":    golden["vocals"],
            "model_vocals":     ", ".join(predicted.get("vocals", [])),
            # --- Model-only categories (no golden standard in MP3) ---
            "model_instruments":  ", ".join(predicted.get("instruments", [])),
            "model_mood":         ", ".join(predicted.get("mood", [])),
            "model_lyricThemes":  ", ".join(predicted.get("lyricThemes", [])),
            "model_soundsLike":   ", ".join(predicted.get("soundsLike", [])),
        }
        rows.append(row)

        # Print side-by-side terminal summary
        print()
        print(f"  {'CATEGORY':<22} {'GOLDEN (Robert)':<35} MODEL OUTPUT")
        print(f"  {'-'*22} {'-'*35} {'-'*35}")
        print(f"  {'Genre':<22} {golden['genre']:<35} {row['model_genre']}")
        print(f"  {'BPM':<22} {str(golden['bpm'] or '—'):<35} {row['essentia_bpm']}")
        print(f"  {'Tempo':<22} {golden['tempo']:<35} {row['model_tempo']}")
        print(f"  {'Vocals':<22} {golden['vocals']:<35} {row['model_vocals']}")
        print(f"  --- model-only (no golden standard) ---")
        print(f"  {'Instruments':<22} {'n/a':<35} {row['model_instruments']}")
        print(f"  {'Mood':<22} {'n/a':<35} {row['model_mood']}")
        print(f"  {'Lyric Themes':<22} {'n/a':<35} {row['model_lyricThemes']}")
        print(f"  {'Sounds Like':<22} {'n/a':<35} {row['model_soundsLike']}")

    if not rows:
        print("\nNo rows to save.")
        return

    df = pd.DataFrame(rows)

    # Excel: two sheets
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        # Sheet 1: everything
        df.to_excel(writer, sheet_name="Full Comparison", index=False)

        # Sheet 2: just the comparable fields (genre, tempo, vocals)
        comparable = df[["filename", "golden_genre", "model_genre",
                          "golden_bpm", "essentia_bpm",
                          "golden_tempo", "model_tempo",
                          "golden_vocals", "model_vocals"]].copy()
        comparable.to_excel(writer, sheet_name="Comparable Fields", index=False)

    csv_path = output_path.replace(".xlsx", ".csv")
    df.to_csv(csv_path, index=False)

    print(f"\n{'='*60}")
    print(f"✓ Evaluation complete! {len(rows)} files processed.")
    print(f"  Excel: {output_path}")
    print(f"  CSV:   {csv_path}")
    print()
    print("NOTE: Only Genre, BPM/Tempo, and Vocals can be directly compared")
    print("because those are the only categories embedded in Robert's MP3 files.")
    print("Instruments, Mood, LyricThemes, and SoundsLike are model-only outputs.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Evaluate MetaMusic Tagger against Robert's golden-standard metadata"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    sniff_p = subparsers.add_parser("sniff", help="Print all metadata fields in a file")
    sniff_p.add_argument("file", help="Path to an audio file")

    eval_p = subparsers.add_parser("eval", help="Run full evaluation on a folder")
    eval_p.add_argument("folder", help="Folder containing Robert's tagged audio files")
    eval_p.add_argument("--gemini-key", default=os.getenv("GEMINI_API_KEY"),
                        help="Gemini API key (or set GEMINI_API_KEY env var)")
    eval_p.add_argument("--output", default="eval_results.xlsx",
                        help="Output Excel file path (default: eval_results.xlsx)")

    args = parser.parse_args()

    if args.command == "sniff":
        sniff_file(args.file)

    elif args.command == "eval":
        if not args.gemini_key:
            print("ERROR: Gemini API key required. Pass --gemini-key or set GEMINI_API_KEY.")
            sys.exit(1)
        run_evaluation(args.folder, args.gemini_key, args.output)


if __name__ == "__main__":
    main()
