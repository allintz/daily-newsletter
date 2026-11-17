#!/usr/bin/env python3
"""Generate TTS audio from text using Kokoro (ONNX).

Usage: python tts_kokoro.py <input_text_file> <output_mp3_file> [voice] [speed]

Requires:
  pip install kokoro-onnx soundfile numpy
  Download model files to same directory as this script:
    kokoro-v1.0.int8.onnx  (quantized, ~80MB)
    voices-v1.0.bin
"""

import sys
import os
import subprocess
import tempfile
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "kokoro-v1.0.int8.onnx")
VOICES_PATH = os.path.join(SCRIPT_DIR, "voices-v1.0.bin")

# Max characters per chunk — Kokoro handles long text but chunking
# keeps memory usage reasonable and avoids quality degradation.
MAX_CHUNK_CHARS = 4000


def chunk_text(text, max_chars=MAX_CHUNK_CHARS):
    """Split text on paragraph boundaries, falling back to sentences."""
    if len(text) <= max_chars:
        return [text]

    chunks = []
    paragraphs = text.split("\n\n")
    current = ""

    for para in paragraphs:
        if len(current) + len(para) + 2 <= max_chars:
            current += ("\n\n" if current else "") + para
        elif len(para) > max_chars:
            # Split long paragraph on sentence boundaries
            if current:
                chunks.append(current)
                current = ""
            import re
            sentences = re.findall(r'[^.!?]+[.!?]+\s*', para) or [para]
            for sentence in sentences:
                if len(current) + len(sentence) <= max_chars:
                    current += sentence
                else:
                    if current:
                        chunks.append(current)
                    current = sentence
        else:
            if current:
                chunks.append(current)
            current = para

    if current:
        chunks.append(current)
    return chunks


def generate_audio(input_file, output_file, voice="am_adam", speed=1.0):
    """Generate MP3 audio from a text file using Kokoro TTS."""
    with open(input_file, "r", encoding="utf-8") as f:
        text = f.read().strip()

    if not text:
        print("Error: Input text is empty", file=sys.stderr)
        sys.exit(1)

    print(f"Loading Kokoro model...")
    kokoro = Kokoro(MODEL_PATH, VOICES_PATH)

    chunks = chunk_text(text)
    print(f"Text split into {len(chunks)} chunk(s)")

    all_samples = []
    sample_rate = None

    for i, chunk in enumerate(chunks):
        print(f"  Generating chunk {i + 1}/{len(chunks)} ({len(chunk)} chars)...")
        samples, sr = kokoro.create(chunk, voice=voice, speed=speed, lang="en-us")
        all_samples.append(samples)
        sample_rate = sr

    # Concatenate all audio chunks
    combined = np.concatenate(all_samples)

    # Write to WAV first, then convert to MP3 with ffmpeg
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_wav = tmp.name
        sf.write(tmp_wav, combined, sample_rate)

    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", tmp_wav, "-codec:a", "libmp3lame", "-b:a", "128k", output_file],
            check=True,
            capture_output=True,
        )
        print(f"Audio saved to {output_file}")
    finally:
        os.unlink(tmp_wav)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <input_text> <output_mp3> [voice] [speed]")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "am_adam"
    speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0

    generate_audio(input_file, output_file, voice, speed)
