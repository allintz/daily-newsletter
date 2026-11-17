#!/usr/bin/env bash
# One-time setup for local Kokoro TTS. Safe to re-run.
set -euo pipefail
DIR="${KOKORO_DIR:-$HOME/.cache/kokoro}"
mkdir -p "$DIR"
[ -x "$DIR/venv/bin/python" ] || python3 -m venv "$DIR/venv"
"$DIR/venv/bin/pip" install -q kokoro-onnx soundfile numpy
BASE=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
for f in kokoro-v1.0.int8.onnx voices-v1.0.bin; do
  [ -s "$DIR/$f" ] || curl -sSL --fail -o "$DIR/$f" "$BASE/$f"
done
command -v ffmpeg >/dev/null || { echo "ffmpeg is missing: install it (apt-get install -y ffmpeg)"; exit 1; }
echo "Kokoro ready in $DIR"
