"""
FastAPI wrapper: Essentia feature extraction → Gemini Disco tag generation.

Run:
    uvicorn api:app --reload --port 8000
"""

import json
import os
import re
import tempfile

from dotenv import load_dotenv
from google import genai
from google.genai import types as genai_types
import uvicorn

load_dotenv()
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError, field_validator

from metamusic_tagger import MetaMusicTagger

app = FastAPI(title="MetaMusic Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://tribe-x.web.app",
        "https://tribe-x.firebaseapp.com",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_tagger = MetaMusicTagger()

_GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
_client = genai.Client(api_key=_GEMINI_API_KEY) if _GEMINI_API_KEY else None

SUPPORTED = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aiff", ".aif"}

DISCO_TAXONOMY = """
Genre (pick 1-2 that best fit — be specific, avoid defaulting to the most obvious):
Ambient, Blues, Classical, Country, Dance, Electronic, Folk, Funk, Hip-hop/rap, Indie, Jazz, Latin, Metal, Pop, Punk, R&B, Reggae, Rock, Singer/songwriter, Soul, Vintage, World

Instruments (pick 2-4 most prominent — only what is clearly audible, not guesses):
Acoustic guitar, Bass, Clarinet, Drums, Electric guitar, Flute, Horns, Keyboard, Orchestral, Percussion, Piano, Saxophone, Strings, Synth, Trumpet

Lyric Themes (pick 1-3, only if vocals are present — leave empty [] for instrumental tracks):
Adventure, Ambition, Betrayal, Celebration, Change, Confidence, Conflict, Connection, Death, Desire, Destiny, Discovery, Dream, Empowerment, Energy, Escape, Faith, Family, Fear, Freedom, Friendship, Fun, Gratitude, Happiness, Heartbreak, Home, Hope, Identity, Individuality, Life, Loneliness, Longing, Loss, Love, Money, Nature, New beginning, Nostalgia, Pain, Party, Power, Rebellion, Regret, Relationship, Romance, Strength, Struggle, Success, Survival, Time, Together, Unity

Mood/Feel (pick 3-4 that are genuinely distinctive for this track — avoid generic defaults):
Anthemic, Atmospheric, Bright, Building, Catchy, Cinematic, Confident, Cool, Dark, Dramatic, Dreamy, Driving, Emotive, Energetic, Epic, Fun, Gritty, Happy, Hopeful, Intense, Light, Minimal, Moody, Mysterious, Party, Percussive, Playful, Positive, Powerful, Quirky, Reflective, Retro, Rhythmic, Romantic, Sad, Sexy, Swagger, Tension, Upbeat, Uplifting, Warm

Tempo (pick exactly 1):
Downtempo, Fast, Midtempo, Slow, Up-tempo

Type (leave as empty [] — the artist fills these manually):
Cover, Demo, Easy-clear, Focus track, Mainstream, One stop, Recognizable, Rerecord, Samples, Score, Sound design, Soundtrack

Vocals (pick 1-2 most accurate descriptors):
A cappella, Aahs, Background vocals, Choir, Clean, Duet, Explicit, Female vocal, Foreign language, Harmonies, Instrumental, Male vocal, Oohs, Whispering, Whistling

Sounds Like (2-3 artist names — pick artists a music supervisor would actually recognise and search for):
"""

_PROMPT_TEMPLATE = """\
You are a music metadata expert specializing in sync licensing for film and TV.

A track has been analyzed with audio feature extraction software. \
Here are the measured characteristics:
{audio_context}

Field reference:
- bpm: tempo in beats per minute
- key / mode: detected musical key and whether major or minor
- key_strength: confidence in key detection (0-1, higher = more certain)
- energy_level: perceived loudness/intensity label
- tempo_feel: subjective pacing label derived from BPM
- danceability_score: Essentia danceability (0-3 scale, higher = more danceable)
- harmonic_to_percussive_ratio: proportion of signal that is harmonic vs percussive (0-1, \
higher = more melodic/harmonic, lower = more beat/noise driven)
- onset_density_per_second: rhythmic event density (higher = busier, more complex rhythm)
- instrument_hints: rough instrument guesses from spectral analysis — treat as hints, not facts
- vocal_presence: estimated boolean from spectral features — may not be perfectly accurate

Your job is to suggest Disco sync licensing tags for this track.
Choose tags that would help a music supervisor find this track in a search.
Be specific and deliberate — favour precision over breadth.
Categories are fixed; tag values can use the vocabulary below, draw from it, or be new if nothing fits.
Return ONLY a valid JSON object — no markdown fences, no text outside the JSON.

CATEGORIES AND VOCABULARY:
{taxonomy}

Return exactly this JSON shape:
{{
  "genre": ["string"],
  "instruments": ["string"],
  "lyricThemes": ["string"],
  "mood": ["string"],
  "tempo": "string",
  "type": [],
  "vocals": ["string"],
  "soundsLike": ["string"],
  "reasoning": "2-3 sentences explaining the musical logic behind your choices — \
reference the specific measured features (BPM, key, harmonic ratio, onset density etc.) \
and explain what they suggest about the track's character. Do NOT repeat or list the tags \
you chose — explain the reasoning that led to them."
}}
"""


class DiscoTags(BaseModel):
    genre: list[str] = []
    instruments: list[str] = []
    lyricThemes: list[str] = []
    mood: list[str] = []
    tempo: str = "Midtempo"
    type: list[str] = []
    vocals: list[str] = []
    soundsLike: list[str] = []

    @field_validator("genre", "instruments", "lyricThemes", "mood", "type", "vocals", "soundsLike", mode="before")
    @classmethod
    def coerce_list(cls, v):
        if isinstance(v, str):
            return [v]
        return v if v is not None else []

    @field_validator("tempo", mode="before")
    @classmethod
    def coerce_tempo(cls, v):
        if isinstance(v, list):
            return v[0] if v else "Midtempo"
        return v if isinstance(v, str) and v else "Midtempo"


def _validate_tags(raw: dict) -> dict:
    try:
        return DiscoTags(**raw).model_dump()
    except ValidationError as e:
        raise HTTPException(status_code=502, detail=f"Gemini response failed schema validation: {e}")


def _extract_json(text: str) -> dict:
    text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`")
    return json.loads(text)


def _call_gemini(audio_context: dict) -> dict:
    if _client is None:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    prompt = _PROMPT_TEMPLATE.format(
        audio_context=json.dumps(audio_context, indent=2),
        taxonomy=DISCO_TAXONOMY,
    )

    try:
        response = _client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return _extract_json(response.text)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Gemini returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {e}")


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    print(f"[analyze] request received, filename={file.filename}")
    ext = os.path.splitext(file.filename or "")[1].lower()
    print(f"[analyze] extension={ext}, supported={ext in SUPPORTED}")
    if ext not in SUPPORTED:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        print(f"[analyze] running Essentia on {tmp_path}")
        audio_context = _tagger.tag_file(tmp_path)
        print(f"[analyze] Essentia done: {audio_context}")
    except Exception as e:
        print(f"[analyze] Essentia FAILED: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

    print("[analyze] calling Gemini...")
    raw_tags = _call_gemini(audio_context)
    print(f"[analyze] Gemini returned: {raw_tags}")
    reasoning = raw_tags.pop("reasoning", "")
    tags = _validate_tags(raw_tags)

    return {
        "audioContext": audio_context,
        "tags": tags,
        "conversationHistory": [
            {
                "role": "model",
                "parts": [{"text": reasoning}],
            }
        ],
    }


class ChatRequest(BaseModel):
    message: str
    conversationHistory: list[dict]
    audioContext: dict


@app.post("/chat")
async def chat(req: ChatRequest):
    if _client is None:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    system_instruction = _PROMPT_TEMPLATE.format(
        audio_context=json.dumps(req.audioContext, indent=2),
        taxonomy=DISCO_TAXONOMY,
    )

    history = [
        genai_types.Content(
            role=item["role"],
            parts=[genai_types.Part(text=p["text"]) for p in item["parts"]],
        )
        for item in req.conversationHistory
    ]

    try:
        chat_session = _client.chats.create(
            model="gemini-2.5-flash",
            history=history,
            config=genai_types.GenerateContentConfig(
                system_instruction=system_instruction,
            ),
        )
        response = chat_session.send_message(req.message)
        raw_tags = _extract_json(response.text)
        reasoning = raw_tags.pop("reasoning", "")
        tags = _validate_tags(raw_tags)

        updated_history = req.conversationHistory + [
            {"role": "user",  "parts": [{"text": req.message}]},
            {"role": "model", "parts": [{"text": reasoning}]},
        ]

        return {
            "message": reasoning,
            "updatedTags": tags,
            "conversationHistory": updated_history,
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Gemini returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {e}")


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
