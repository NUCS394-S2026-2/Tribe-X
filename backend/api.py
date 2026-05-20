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
from pydantic import BaseModel

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
Genre (pick 1-2): Ambient, Blues, Classical, Country, Dance, Electronic, Folk, Funk, Hip-hop/rap, Indie, Jazz, Latin, Metal, Pop, Punk, R&B, Reggae, Rock, Singer/songwriter, Soul, Vintage, World

Instruments (pick relevant): Acoustic guitar, Bass, Clarinet, Drums, Electric guitar, Flute, Horns, Keyboard, Orchestral, Percussion, Piano, Saxophone, Strings, Synth, Trumpet

Lyric Themes (pick relevant, only if vocals present — leave empty [] for instrumental): Adventure, Ambition, Betrayal, Celebration, Change, Confidence, Conflict, Connection, Death, Desire, Destiny, Discovery, Dream, Empowerment, Energy, Escape, Faith, Family, Fear, Freedom, Friendship, Fun, Gratitude, Happiness, Heartbreak, Home, Hope, Identity, Individuality, Life, Loneliness, Longing, Loss, Love, Money, Nature, New beginning, Nostalgia, Pain, Party, Power, Rebellion, Regret, Relationship, Romance, Strength, Struggle, Success, Survival, Time, Together, Unity

Mood/Feel (pick 3-5): Anthemic, Atmospheric, Bright, Building, Catchy, Cinematic, Confident, Cool, Dark, Dramatic, Dreamy, Driving, Emotive, Energetic, Epic, Fun, Gritty, Happy, Hopeful, Intense, Light, Minimal, Moody, Mysterious, Party, Percussive, Playful, Positive, Powerful, Quirky, Reflective, Retro, Rhythmic, Romantic, Sad, Sexy, Swagger, Tension, Upbeat, Uplifting, Warm

Tempo (pick 1): Downtempo, Fast, Midtempo, Slow, Up-tempo

Type (leave as empty [] — Robert fills these manually): Cover, Demo, Easy-clear, Focus track, Mainstream, One stop, Recognizable, Rerecord, Samples, Score, Sound design, Soundtrack

Vocals (pick relevant): A cappella, Aahs, Background vocals, Choir, Clean, Duet, Explicit, Female vocal, Foreign language, Harmonies, Instrumental, Male vocal, Oohs, Whispering, Whistling

Sounds Like (infer 3-5 artist names from the audio characteristics)
"""

_PROMPT_TEMPLATE = """\
You are a music metadata expert specializing in sync licensing for film and TV.

You have analyzed this track and found the following audio characteristics:
{audio_context}

Your job is to suggest metadata tags for the Disco sync licensing platform.
You must populate all 7 categories below.
The pre-set tag lists are vocabulary guidance — use them where they fit, draw \
inspiration from them, or create new tags if nothing fits.
Tags should be meaningful to a music supervisor searching for tracks.
Categories are fixed; tag values are flexible.
Return ONLY a valid JSON object — no markdown fences, no text outside the JSON.

CATEGORIES AND VOCABULARY GUIDANCE:
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
  "reasoning": "one sentence explaining your main choices"
}}
"""


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
    tags = _call_gemini(audio_context)
    print(f"[analyze] Gemini returned: {tags}")
    reasoning = tags.pop("reasoning", "")

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
        tags = _extract_json(response.text)
        reasoning = tags.pop("reasoning", "")

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
