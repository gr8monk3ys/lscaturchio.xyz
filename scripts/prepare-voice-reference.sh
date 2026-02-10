#!/usr/bin/env bash
#
# Extract WAV reference audio from MP4 voice recordings for XTTS v2 voice cloning.
# Run once after cloning the repo or when voice recordings change.
#
# Usage: bash scripts/prepare-voice-reference.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VOICE_DIR="$PROJECT_ROOT/voice"
DOWNLOADS_DIR="$HOME/Downloads"

# Source recordings — adjust filenames if yours differ
RECORDINGS=(
  "Recording 1.mp4"
  "Recording 2.mp4"
  "Recording 3.mp4"
)

# Check ffmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "Error: ffmpeg is not installed."
  echo "  macOS:  brew install ffmpeg"
  echo "  Ubuntu: sudo apt-get install ffmpeg"
  exit 1
fi

# Create output directory
mkdir -p "$VOICE_DIR"

count=0
for rec in "${RECORDINGS[@]}"; do
  count=$((count + 1))
  src="$DOWNLOADS_DIR/$rec"
  dst="$VOICE_DIR/reference_${count}.wav"

  if [[ ! -f "$src" ]]; then
    echo "Warning: '$src' not found, skipping."
    continue
  fi

  if [[ -f "$dst" ]]; then
    echo "Skipping reference_${count}.wav (already exists)"
    continue
  fi

  echo "Extracting reference_${count}.wav from '$rec'..."
  ffmpeg -i "$src" -vn -acodec pcm_s16le -ar 22050 -ac 1 "$dst" -y -loglevel warning
done

echo ""
echo "Voice reference files in $VOICE_DIR:"
ls -lh "$VOICE_DIR"/reference_*.wav 2>/dev/null || echo "  (none found)"
