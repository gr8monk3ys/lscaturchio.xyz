#!/usr/bin/env bash
#
# Create a Python virtual environment and install XTTS v2 dependencies.
# Run once before using `bun run generate-tts`.
#
# Usage: bash scripts/setup-tts-venv.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.tts-venv"
REQUIREMENTS="$SCRIPT_DIR/requirements-tts.txt"

# Prefer python3.10+ if available (XTTS v2 works best with 3.10-3.11)
PYTHON=""
for candidate in python3.11 python3.10 python3; do
  if command -v "$candidate" &>/dev/null; then
    PYTHON="$candidate"
    break
  fi
done

if [[ -z "$PYTHON" ]]; then
  echo "Error: Python 3 not found. Install Python 3.10+ first."
  echo "  macOS: brew install python@3.11"
  exit 1
fi

echo "Using $($PYTHON --version) at $(command -v "$PYTHON")"

# Check ffmpeg (needed at runtime for WAV -> MP3 conversion)
if ! command -v ffmpeg &>/dev/null; then
  echo ""
  echo "Warning: ffmpeg is not installed. You'll need it for generate-tts."
  echo "  macOS:  brew install ffmpeg"
  echo "  Ubuntu: sudo apt-get install ffmpeg"
  echo ""
fi

# Create venv
if [[ -d "$VENV_DIR" ]]; then
  echo "Virtual environment already exists at $VENV_DIR"
  echo "To recreate, delete it first: rm -rf $VENV_DIR"
else
  echo "Creating virtual environment..."
  "$PYTHON" -m venv "$VENV_DIR"
fi

# Activate and install
echo "Installing dependencies (this may take a few minutes on first run)..."
"$VENV_DIR/bin/pip" install --upgrade pip -q
"$VENV_DIR/bin/pip" install -r "$REQUIREMENTS"

# Smoke test
echo ""
echo "Running smoke test..."
"$VENV_DIR/bin/python" -c "
from TTS.api import TTS
import torch
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f'  TTS library loaded successfully')
print(f'  PyTorch device: {device} (XTTS v2 uses CPU on macOS, CUDA on Linux)')
print(f'  XTTS v2 will download on first use (~1.8GB, cached afterwards)')
"

echo ""
echo "Setup complete! Virtual environment at: $VENV_DIR"
echo ""
echo "Next steps:"
echo "  1. bash scripts/prepare-voice-reference.sh  (extract voice references)"
echo "  2. bun run generate-tts                     (generate audio)"
