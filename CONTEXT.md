# MetaMusic — Claude Code Context

## Client

**Robert @ Solo Hands Music LLC**

- Composes original music weekly for film/TV sync licensing
- Uses **Disco** to pitch tracks to music supervisors
- Currently tags MP3s manually in Disco — this is the pain point MetaMusic solves

## What is Disco?

Disco is a music catalog management and pitching platform used by music supervisors. Supervisors search Disco by keyword (e.g. "sad piano cinematic") and filter by tags. If a track is untagged or poorly tagged, it is invisible in search results. Good tags = discoverability = sync placements.

## Project Goal

Build a web app that:

1. Accepts an MP3 upload
2. Analyzes it with Essentia (fast) → generates initial Disco tags via Claude
3. Optionally transcribes lyrics via Whisper (separate user-triggered step)
4. Lets Robert refine tags via a chat interface (without re-running analysis)
5. Exports final tags as CSV for upload to Disco
6. Saves tracks + final tags per user account for future reference

---

## Architecture

### Pipeline (three phases)

**Phase 1 — Analysis (runs ONCE per MP3, fast ~5-10s)**

```
MP3
 └── Essentia → BPM, key, mode, energy level, danceability,
                harmonic ratio, tempo feel, instrument hints,
                vocal presence estimate
                        ↓
              audio_context JSON (stored in DB + frontend state)
                        ↓
              Gemini API → initial Disco tags JSON
```

**Phase 1b — Lyric Transcription (OPTIONAL, user-triggered, slow ~30-180s)**

```
[ Transcribe Lyrics ] button
 └── Whisper → lyrics transcript
                        ↓
              Claude re-prompted with lyrics added → updated tags
```

This is a separate button so Robert is not blocked waiting for Whisper
on every upload. Instrumental tracks never need it.

**Phase 2 — Refinement (chat loop, NO re-analysis)**

```
Robert: "reconsider the genre"
  → send { message, conversation_history, audio_context } to /chat
  → Gemini reasons over same audio_context → returns updated tags
Robert: "mood feels more cinematic than dark"
  → same pattern
... until happy → export CSV
```

The `audio_context` is computed once and passed on every `/chat` request.
Chat history lives in frontend memory only — not persisted to DB.

---

## User Accounts & Persistence

### What is saved (per user, in DB + Storage)

```
User (Firebase Auth)
 └── Track records (Firestore)
       ├── mp3_url          ← Firebase Storage reference to raw MP3
       ├── audio_context    ← small JSON (~500 bytes), Essentia output
       ├── final_tags       ← Disco tags JSON
       ├── lyrics           ← Whisper transcript or null
       └── created_at

NOTE: audio_context IS stored — it's tiny (a few hundred bytes of JSON)
and essentially free in Firestore. This avoids any re-analysis when
Robert wants to continue refining a saved track.
```

### What is NOT saved

- Chat history — dies when browser tab closes
- Intermediate tag states — only final tags saved

### Returning to a previous track

When Robert reopens a saved track:

- Final tags displayed immediately from Firestore
- [ Continue Refining ] loads audio_context from Firestore → fresh chat
  session starts instantly, no re-analysis needed
- [ Re-transcribe Lyrics ] re-runs Whisper on stored MP3 if needed
- [ Download CSV ] available at any time from saved final_tags

### Why chat history is not saved

- Tags are the refinement output — if saved, they already reflect his last feedback
- Stale chat threads from days ago are confusing to re-enter mid-conversation
- Adds DB + state complexity for unclear benefit
- Fresh chat with saved `audio_context` is just as good as resuming old chat

> **Open question for Robert**: Does he want to directly edit saved tags inline,
> or always refine through chat? This affects UI design.

---

## Backend Endpoints (FastAPI)

**`POST /analyze`**

- Input: MP3 file upload
- Runs: Essentia feature extraction → Gemini initial tag generation
- Saves: raw MP3 to Firebase Storage, audio_context + initial tags to Firestore
- Returns: `{ trackId, audioContext, tags, conversationHistory }`

**`POST /transcribe`**

- Input: `{ trackId }` (audio already saved)
- Runs: Whisper on saved audio → re-prompts Gemini with lyrics added
- Updates: DB record with lyrics + updated tags
- Returns: `{ lyrics, updatedTags }`

**`POST /chat`**

- Input: `{ message, conversationHistory, audioContext }`
- Runs: Gemini API with full history + pinned audioContext
- Returns: `{ message, updatedTags }`

**`POST /save-tags`**

- Input: `{ trackId, finalTags }`
- Saves final confirmed tags to DB
- Returns: `{ success }`

**`GET /tracks`**

- Returns list of user's saved tracks + their final tags

---

## Frontend (React + TypeScript)

### State per session

```typescript
{
  audioContext: {...},         // loaded from DB or set after /analyze
  conversationHistory: [...],  // grows with each chat message, never persisted
  currentTags: {...},          // updated after each LLM response
  trackId: string,             // DB reference
}
```

### UI sections

- MP3 upload (drag & drop or file picker)
- [ Analyze ] button → fast, triggers Phase 1
- [ Transcribe Lyrics ] button → slow, optional, triggers Phase 1b
- Tag display (visual pills organized by Disco category)
- Chat input for refinement
- [ Copy ] button + [ Download CSV ] button (pure frontend)
- Track history page — list of saved tracks, each showing:
  - Track name + created date
  - Final tags summary
  - [ Continue Refining ] → loads audio_context from Firestore, opens chat
  - [ Re-transcribe Lyrics ] → re-runs Whisper if needed
  - [ Download CSV ] → exports saved final_tags

---

## What to Pass to Claude (audio_context shape)

Pass ONLY human-readable musical descriptions.
Do NOT pass raw signal arrays (MFCCs, spectral centroid numbers etc.)
— the LLM cannot interpret raw signal numbers meaningfully.

```json
{
  "bpm": 124,
  "key": "C minor",
  "mode": "minor",
  "energy_level": "High",
  "tempo_feel": "Upbeat",
  "danceability": "high",
  "harmonic_ratio": "melodic-dominant",
  "instrument_hints": ["synth", "bass", "drums"],
  "vocal_presence": true,
  "lyrics": "full transcript here or null"
}
```

---

## Disco Tag Taxonomy (what Claude must output)

### How Disco tags actually work

- The **7 categories are fixed** — hardcoded in Disco, cannot be changed
- The **tag values are open** — Disco provides 150+ pre-set suggestions,
  but users can create any custom tag within a category
- This means Claude is NOT constrained to a fixed picklist for values —
  it should use pre-set tags where they fit, combine them, or invent
  new ones if the track warrants it

### Prompt instruction for Claude

```
You must populate all 7 categories below.
The pre-set tag lists are vocabulary guidance — use them where they fit,
draw inspiration from them, or create new tags if nothing fits.
Tags should be meaningful to a music supervisor searching for tracks.
Categories are fixed; tag values are flexible.
```

### The 7 fixed categories + pre-set vocabulary guidance

**Genre** (pick 1-2):
Ambient, Blues, Classical, Country, Dance, Electronic, Folk, Funk,
Hip-hop/rap, Indie, Jazz, Latin, Metal, Pop, Punk, R&B, Reggae, Rock,
Singer/songwriter, Soul, Vintage, World

**Instruments** (pick relevant):
Acoustic guitar, Bass, Clarinet, Drums, Electric guitar, Flute, Horns,
Keyboard, Orchestral, Percussion, Piano, Saxophone, Strings, Synth, Trumpet

**Lyric Themes** (pick relevant, only if vocals present):
Adventure, Ambition, Betrayal, Celebration, Change, Christmas, Confidence,
Conflict, Connection, Death, Desire, Destiny, Discovery, Dream, Empowerment,
Energy, Escape, Faith, Family, Fear, Freedom, Friendship, Fun, Gratitude,
Happiness, Heartbreak, Home, Hope, Identity, Individuality, Life, Loneliness,
Longing, Loss, Love, Money, Nature, New beginning, Nostalgia, Pain, Party,
Power, Rebellion, Regret, Relationship, Romance, Strength, Struggle, Success,
Survival, Time, Together, Unity

**Mood/Feel** (pick 3-5):
Anthemic, Atmospheric, Bright, Building, Catchy, Cinematic, Confident, Cool,
Dark, Dramatic, Dreamy, Driving, Emotive, Energetic, Epic, Fun, Gritty,
Happy, Hopeful, Intense, Light, Minimal, Moody, Mysterious, Party, Percussive,
Playful, Positive, Powerful, Quirky, Reflective, Retro, Rhythmic, Romantic,
Sad, Sexy, Swagger, Tension, Upbeat, Uplifting, Warm

**Tempo** (pick 1):
Downtempo, Fast, Midtempo, Slow, Up-tempo

**Type** (pick relevant — Robert fills most of these manually):
Cover, Demo, Easy-clear, Focus track, Mainstream, One stop, Recognizable,
Rerecord, Samples, Score, Sound design, Soundtrack

**Vocals** (pick relevant):
A cappella, Aahs, Background vocals, Choir, Clean, Duet, Explicit,
Female vocal, Foreign language, French language, German language, Harmonies,
Instrumental, Male vocal, Oohs, Spanish language, Whispering, Whistling

**Sounds Like** (stretch goal — LLM infers from audio context):
3-5 artist names the track resembles

---

## Gemini Prompt Strategy

**System prompt** (sent on every /chat call):

```
You are a music metadata expert specializing in sync licensing for film and TV.

You have analyzed this track and found the following:
{audio_context}

Your job is to suggest metadata tags for the Disco sync licensing platform.
The 7 tag categories are fixed. Tag values can use the pre-set vocabulary,
draw inspiration from it, or be entirely new if the track warrants it.
Always return tags as a valid JSON object.
Explain your reasoning briefly so the user can understand and refine.

CATEGORIES AND VOCABULARY GUIDANCE:
{full taxonomy}
```

**Python SDK usage (google-generativeai):**

```python
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.5-flash")

# For chat sessions (maintains history)
chat = model.start_chat(history=conversation_history)
response = chat.send_message(user_message)
```

**On refinement messages**, Robert might say things like:

- "try the genre again"
- "this feels more cinematic than electronic"
- "reconsider the mood, it's darker than you suggested"
- "sounds like Massive Attack not Radiohead"

Claude should re-reason from the same `audio_context` and update only
the relevant tag categories.

---

## Existing Codebase

### `metamusic_tagger.py` — KEEP extraction, REPLACE classifiers

- `extract_essentia_features()` — **keep as-is**
  Returns raw Essentia measurements — this feeds into audio_context
- `classify_genre()`, `classify_mood()`, `classify_instrumentation()`,
  `classify_vocals()`, `classify_sync_use_cases()`, `generate_tags()`
  — **replace entirely** with LLM call
- `MetaMusicTagger.tag_file()` — **refactor** to return `audio_context`
  JSON instead of final tags
- `MetaMusicTagger.tag_folder()` — **not needed** for web app, ignore

### `api.py` — EXTEND with new endpoints

- `POST /analyze` — **refactor**: Essentia only + Claude, return
  `{ trackId, audioContext, tags, conversationHistory }`
- `POST /transcribe` — **add new**: Whisper on saved audio + re-prompt Claude
- `POST /chat` — **add new**: chat refinement loop
- `POST /save-tags` — **add new**: persist final tags to DB
- `GET /tracks` — **add new**: return user's track history
- CORS origins already configured for localhost + Firebase

### `AudioTagger.tsx` — EXTEND with chat + history UI

- File upload + validation logic — **keep as-is**
- `MusicTagsDisplay` — **extend** to show all Disco tag categories
- **Add**: [ Transcribe Lyrics ] button with its own loading state
- **Add**: chat input + message history display
- **Add**: CSV download button alongside copy button
- **Add**: track history view (list of saved tracks)

### `audio_semantic_tagger.py`

- Research/demo file — **not needed** for MVP, ignore

---

## Key Decisions Made

- Lyric transcription (Whisper) is a SEPARATE optional button — not bundled
  with main Analyze flow — because Whisper is slow (30-180s) and many
  of Robert's tracks are instrumental
- Firebase Auth + Firestore for auth and DB
- Firebase Storage for raw MP3 files
- audio_context IS stored in Firestore — tiny JSON, essentially free,
  enables instant [ Continue Refining ] without any re-analysis
- Chat history is NOT persisted — fresh chat starts from saved audio_context
- Tag refinement always through chat — inline editing is a stretch goal
- Raw signal arrays (MFCCs, spectral centroid values) NOT passed to Claude
- CLAP model skipped — "sounds like" handled by LLM reasoning
- Type tags (one-stop, easy-clear etc.) filled manually by Robert

---

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind
- **Backend**: Python + FastAPI
- **Audio analysis**: Essentia + librosa
- **Lyrics**: Whisper (openai-whisper) — optional, user-triggered
- **LLM**: Google Gemini API (gemini-2.5-flash) — free tier via Google AI Studio
  - Free: 15 RPM, 1,500 requests/day, no credit card needed
  - Key obtained from aistudio.google.com
  - Note: free tier prompts may be used by Google for model training —
    flag to Robert since unreleased music audio context passes through
  - Set key as environment variable: GEMINI_API_KEY
- **Auth + DB**: Firebase Auth + Firestore
- **File storage**: Firebase Storage (raw MP3 only)
- **Export**: CSV download via browser (no backend needed)

## Decisions on Infrastructure

1. **DB + Auth**: Firebase Auth + Firestore
2. **Audio file storage**: Firebase Storage — store the raw MP3 + final tags.
   Do NOT store audio_context in DB (saves cost/complexity).
   Instead, add a [ Re-analyze ] button that re-runs Essentia on the saved MP3
   to regenerate audio_context on demand before starting a chat session.
3. **Direct tag editing**: Always through chat. Inline editing is a stretch goal.
