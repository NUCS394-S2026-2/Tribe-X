"""
Unit tests for the Gemini integration in api.py.

Run:
    pytest backend/test_api.py
"""

import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException


SAMPLE_AUDIO_CONTEXT = {
    "bpm": 120.0,
    "key": "C major",
    "key_strength": 0.85,
    "energy_level": "High",
    "tempo_feel": "Upbeat",
    "danceability_score": 1.8,
    "harmonic_to_percussive_ratio": 0.62,
    "onset_density_per_second": 3.1,
    "instrument_hints": ["synth lead", "drums"],
    "vocal_presence": True,
    "lyrics": None,
}

VALID_GEMINI_RESPONSE = {
    "genre": ["Electronic", "Pop"],
    "instruments": ["Synth", "Drums"],
    "lyricThemes": ["Freedom"],
    "mood": ["Energetic", "Uplifting"],
    "tempo": "Up-tempo",
    "type": [],
    "vocals": ["Female vocal"],
    "soundsLike": ["Dua Lipa"],
    "reasoning": "High BPM and harmonic ratio indicate an energetic, melodic track.",
}


def _make_mock_client(response_text: str) -> MagicMock:
    """Return a genai.Client mock whose generate_content returns response_text."""
    mock_response = MagicMock()
    mock_response.text = response_text

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response
    return mock_client


def test_warmup_then_key_extractor_works():
    """After warmup(), KeyExtractor should return valid types — confirms Essentia is functional."""
    import numpy as np
    import essentia.standard as es
    from metamusic_tagger import MetaMusicTagger

    MetaMusicTagger().warmup()

    sine = np.sin(2 * np.pi * 440 * np.linspace(0, 1, 22050, dtype=np.float32))
    key, scale, key_strength = es.KeyExtractor()(sine)

    assert isinstance(key, str) and len(key) > 0
    assert scale in ("major", "minor")
    assert 0.0 <= float(key_strength) <= 1.0


def test_extract_essentia_features_tempo_is_python_float(tmp_path):
    """tempo must be a plain Python float after the librosa beat_track swap (not a numpy scalar)."""
    import soundfile as sf
    import numpy as np
    from metamusic_tagger import extract_essentia_features

    audio_path = str(tmp_path / "sine.wav")
    sf.write(audio_path, np.sin(2 * np.pi * 440 * np.linspace(0, 3, 22050 * 3, dtype=np.float32)), 22050)

    features = extract_essentia_features(audio_path)

    assert type(features["tempo"]) is float
    assert features["tempo"] >= 0.0


def test_call_gemini_happy_path():
    """_call_gemini parses valid JSON returned by Gemini and returns a dict."""
    import api

    mock_client = _make_mock_client(json.dumps(VALID_GEMINI_RESPONSE))

    with patch.object(api, "_client", mock_client):
        result = api._call_gemini(SAMPLE_AUDIO_CONTEXT)

    assert result["genre"] == ["Electronic", "Pop"]
    assert result["tempo"] == "Up-tempo"
    assert result["reasoning"] == "High BPM and harmonic ratio indicate an energetic, melodic track."
    mock_client.models.generate_content.assert_called_once()


def test_call_gemini_invalid_json_raises_http_500():
    """_call_gemini raises HTTPException 500 when Gemini returns non-JSON text."""
    import api

    mock_client = _make_mock_client("Sorry, I can't help with that right now.")

    with patch.object(api, "_client", mock_client):
        with pytest.raises(HTTPException) as exc_info:
            api._call_gemini(SAMPLE_AUDIO_CONTEXT)

    assert exc_info.value.status_code == 500
    assert "invalid json" in exc_info.value.detail.lower()
