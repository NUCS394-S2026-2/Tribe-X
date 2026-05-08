"""
FastAPI wrapper around MetaMusicTagger.
Exposes POST /analyze — accepts an audio file upload, returns JSON tags.

Run:
    uvicorn api:app --reload --port 8000
"""

import os
import tempfile

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from metamusic_tagger import MetaMusicTagger

app = FastAPI(title="MetaMusic Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://tribe-x.web.app",
        "https://tribe-x.firebaseapp.com",
    ],
    allow_methods=["POST"],
    allow_headers=["*"],
)

_tagger = MetaMusicTagger()

SUPPORTED = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aiff", ".aif"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in SUPPORTED:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = _tagger.tag_file(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

    genres = [result["genre"], result["subgenre"]]
    instruments = [i.strip() for i in result["instrumentation"].split(",") if i.strip()]
    vocal_traits = [] if result["vocals"] == "No Vocals" else [result["vocals"]]
    sounds_like = [s.strip() for s in result["sync_use_cases"].split("|") if s.strip()]

    return {
        "genres": genres,
        "instruments": instruments,
        "vocalTraits": vocal_traits,
        "soundsLike": sounds_like,
        "confidenceScore": result["key_strength"],
    }


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
