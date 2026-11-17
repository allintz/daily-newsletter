#!/usr/bin/env python3
"""Turn a spoken-word script into a podcast episode folder.

Usage (run with the Kokoro venv python, see setup.sh):
  make_episode.py <episode_dir> --title "..." --description "..." [--voice af_heart] [--speed 1.0]

<episode_dir> must contain script.txt (plain spoken text) and may contain
notes.md (show notes with sources). Writes <slug>.mp3 and episode.json there.
"""
import argparse, json, os, re, subprocess, sys, tempfile
from datetime import datetime, timezone
from email.utils import format_datetime

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

KOKORO_DIR = os.environ.get("KOKORO_DIR", os.path.expanduser("~/.cache/kokoro"))


def clean_for_speech(text):
    """Remove things a voice would read badly."""
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)      # markdown links -> label
    text = re.sub(r"https?://\S+", "", text)                    # bare URLs
    text = re.sub(r"^\s{0,3}#{1,6}\s*", "", text, flags=re.M)   # headings
    text = re.sub(r"^\s*[-*•]\s+", "", text, flags=re.M)        # bullets
    text = re.sub(r"[*_`]+", "", text)                          # emphasis marks
    text = text.replace("%", " percent").replace("&", " and ")
    text = text.replace("—", ", ").replace("–", " to ")
    return re.sub(r"[ \t]+", " ", text).strip()


def paragraphs(text, max_chars=1200):
    """Short chunks keep Kokoro's pacing steady; split on blank lines, then sentences."""
    out = []
    for para in re.split(r"\n\s*\n", text):
        para = " ".join(para.split())
        if not para:
            continue
        cur = ""
        for sent in re.findall(r"[^.!?]+[.!?]+[\"')]*\s*|[^.!?]+$", para):
            if cur and len(cur) + len(sent) > max_chars:
                out.append(cur.strip()); cur = ""
            cur += sent
        if cur.strip():
            out.append(cur.strip())
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode_dir")
    ap.add_argument("--title", required=True)
    ap.add_argument("--description", required=True)
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--speed", type=float, default=1.0)
    a = ap.parse_args()

    ep = os.path.abspath(a.episode_dir)
    slug = os.path.basename(ep)
    with open(os.path.join(ep, "script.txt"), encoding="utf-8") as f:
        chunks = paragraphs(clean_for_speech(f.read()))
    if not chunks:
        sys.exit("script.txt is empty")

    kokoro = Kokoro(os.path.join(KOKORO_DIR, "kokoro-v1.0.int8.onnx"),
                    os.path.join(KOKORO_DIR, "voices-v1.0.bin"))
    parts, rate = [], 24000
    for i, chunk in enumerate(chunks, 1):
        print(f"  {i}/{len(chunks)} ({len(chunk)} chars)", flush=True)
        samples, rate = kokoro.create(chunk, voice=a.voice, speed=a.speed, lang="en-us")
        parts.append(samples)
        parts.append(np.zeros(int(rate * 0.45), dtype=samples.dtype))  # pause between paragraphs

    mp3 = os.path.join(ep, f"{slug}.mp3")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav = tmp.name
    try:
        sf.write(wav, np.concatenate(parts), rate)
        subprocess.run(["ffmpeg", "-y", "-i", wav, "-ac", "1", "-codec:a", "libmp3lame",
                        "-b:a", "64k", mp3], check=True, capture_output=True)
        dur = float(subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3],
            check=True, capture_output=True, text=True).stdout.strip())
    finally:
        os.unlink(wav)

    meta = {
        "slug": slug,
        "title": a.title,
        "description": a.description,
        "pubDate": format_datetime(datetime.now(timezone.utc), usegmt=True),
        "file": f"{slug}.mp3",
        "bytes": os.path.getsize(mp3),
        "duration": round(dur),
        "voice": a.voice,
        "notes": "notes.md" if os.path.exists(os.path.join(ep, "notes.md")) else None,
    }
    with open(os.path.join(ep, "episode.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"Wrote {mp3} ({meta['bytes']/1e6:.1f} MB, {dur/60:.1f} min)")


if __name__ == "__main__":
    main()
