#!/usr/bin/env python3
"""
XTTS v2 voice cloning synthesizer.

Long-running process that reads JSON-line commands from stdin and writes
synthesized WAV files. Designed to be spawned by generate-tts.ts.

Protocol (one JSON object per line):
  Input:  {"text": "...", "output_path": "/abs/path.wav", "voice_dir": "/abs/voice/"}
  Output: {"success": true, "output_path": "/abs/path.wav", "duration_seconds": 5.2}

  Input:  {"command": "quit"}
  Output: {"success": true, "command": "quit"}

Errors:
  Output: {"success": false, "error": "description"}
"""

import json
import os
import sys
import time
import glob

# Suppress noisy library warnings before importing TTS
os.environ.setdefault("TTS_HOME", os.path.expanduser("~/.local/share/tts"))

# Auto-accept Coqui CPML license (non-commercial)
os.environ["COQUI_TOS_AGREED"] = "1"

# PyTorch 2.6+ defaults weights_only=True in torch.load(), but TTS 0.22.0
# uses pickle-based checkpoints from Coqui's official model repo.
# Patch torch.load to allow loading these trusted model files.
import torch
_original_torch_load = torch.load


def _patched_torch_load(*args, **kwargs):
    if "weights_only" not in kwargs:
        kwargs["weights_only"] = False
    return _original_torch_load(*args, **kwargs)


torch.load = _patched_torch_load

_tts_instance = None


def get_tts():
    """Lazy-load the XTTS v2 model (downloads ~1.8GB on first use)."""
    global _tts_instance
    if _tts_instance is not None:
        return _tts_instance

    import torch
    from TTS.api import TTS

    # XTTS v2's GPT-2 component can't infer attention masks on MPS,
    # so we use CUDA when available and fall back to CPU otherwise.
    if torch.cuda.is_available():
        device = "cuda"
    else:
        device = "cpu"

    log(f"Loading XTTS v2 model on {device}...")
    start = time.time()

    _tts_instance = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

    elapsed = time.time() - start
    log(f"Model loaded in {elapsed:.1f}s")
    return _tts_instance


def log(msg):
    """Write diagnostic messages to stderr (stdout is reserved for protocol)."""
    print(f"[tts_synthesize] {msg}", file=sys.stderr, flush=True)


def find_reference_wavs(voice_dir):
    """Find all reference_*.wav files in the voice directory."""
    pattern = os.path.join(voice_dir, "reference_*.wav")
    files = sorted(glob.glob(pattern))
    if not files:
        raise FileNotFoundError(f"No reference_*.wav files found in {voice_dir}")
    return files


def synthesize(text, output_path, voice_dir):
    """Synthesize text to a WAV file using XTTS v2 with voice cloning."""
    tts = get_tts()
    ref_wavs = find_reference_wavs(voice_dir)

    log(f"Synthesizing {len(text)} chars with {len(ref_wavs)} reference(s)...")
    start = time.time()

    tts.tts_to_file(
        text=text,
        file_path=output_path,
        speaker_wav=ref_wavs,
        language="en",
        split_sentences=True,
    )

    elapsed = time.time() - start

    # Calculate duration from the output file
    duration = 0.0
    try:
        import wave
        with wave.open(output_path, "r") as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration = frames / float(rate)
    except Exception:
        pass

    log(f"Synthesized in {elapsed:.1f}s ({duration:.1f}s audio)")
    return duration


def handle_request(req):
    """Process a single JSON request and return a JSON response."""
    try:
        # Quit command
        if req.get("command") == "quit":
            return {"success": True, "command": "quit"}

        text = req.get("text", "").strip()
        output_path = req.get("output_path", "")
        voice_dir = req.get("voice_dir", "")

        if not text:
            return {"success": False, "error": "Missing 'text' field"}
        if not output_path:
            return {"success": False, "error": "Missing 'output_path' field"}
        if not voice_dir:
            return {"success": False, "error": "Missing 'voice_dir' field"}

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        duration = synthesize(text, output_path, voice_dir)

        return {
            "success": True,
            "output_path": output_path,
            "duration_seconds": round(duration, 2),
        }

    except Exception as e:
        log(f"Error: {e}")
        return {"success": False, "error": str(e)}


def main():
    """Main loop: read JSON lines from stdin, write responses to stdout."""
    log("Ready. Waiting for requests on stdin...")

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            req = json.loads(line)
        except json.JSONDecodeError as e:
            resp = {"success": False, "error": f"Invalid JSON: {e}"}
            print(json.dumps(resp), flush=True)
            continue

        resp = handle_request(req)
        print(json.dumps(resp), flush=True)

        # Quit after responding to quit command
        if req.get("command") == "quit":
            log("Shutting down.")
            break

    log("Exiting.")


if __name__ == "__main__":
    main()
