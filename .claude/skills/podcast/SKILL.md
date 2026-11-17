---
name: podcast
description: Make a podcast episode on any topic and publish it to the user's podcast feed. Researches or takes supplied material, writes a script meant to be heard, generates the audio locally with Kokoro TTS, and publishes it to the Deep Democracy Learning feed. Use when the user asks for an episode, a podcast, "put this in my feed", or an audio version of an analysis.
---

# Podcast episode

The user listens to everything through their podcast feed. When they ask for an analysis, briefing or explainer in this repo, the deliverable is an episode in the feed unless they say otherwise. Do not ask whether they want it in the feed.

Feed: `https://allintz.github.io/democracy-newsletter/podcast/feed.xml`

## Steps

1. **Research and write `notes.md`.** The full written analysis with every source linked. This is the show notes; the feed description links to it.
2. **Write `script.txt`.** A separate text written for the ear (rules below). Never feed `notes.md` to the voice.
3. **Create the episode folder** `episodes/YYYY-MM-DD-short-slug/` containing `notes.md` and `script.txt`. The slug becomes the audio filename and must be unique.
4. **Generate audio.**
   ```bash
   podcast-tools/setup.sh        # first time in a session; installs Kokoro, downloads the model
   ~/.cache/kokoro/venv/bin/python podcast-tools/make_episode.py episodes/<slug> \
     --title "Episode title" --description "One or two plain sentences."
   ```
   This writes `<slug>.mp3` and `episode.json`. Default voice is `af_heart`; the user dislikes `am_adam`.
5. **Listen-check without ears.** Confirm the reported duration is plausible (about 150 words per minute) and re-read `script.txt` for anything the voice would mangle.
6. **Publish.** Commit the episode folder and push the branch. The `Publish Podcast Episode` workflow runs on any push that touches `episodes/**` on `main` or a `claude/**` branch, copies the audio and notes into `allintz/democracy-newsletter`, and adds the episode to `feed.xml`, keeping earlier episodes.
7. **Verify.** Check the run with `gh api repos/allintz/daily-newsletter/actions/runs?per_page=3` and confirm it concluded `success`. Report the result plainly; if it failed, read the failing step before saying anything is published.

## Writing for the ear

- Open with the question and the answer. A listener cannot skim ahead.
- Short sentences. One idea each. Read it aloud in your head; if you run out of breath, split it.
- Say where you are: "First", "Second", "Now the other side", "So where do we land".
- No citations, URLs, brackets, tables, bullet lists or headings in the script. Attribute in speech ("the Associated Press reported") and keep links in `notes.md`.
- Numbers: round them, and say them the way a person would. "About four tenths of one percent", "roughly one in two hundred and fifty". Write years as words when digits could be misread ("twenty twenty five"). Never read out a column of figures.
- Spell out initialisms the voice stumbles on with spaces ("F B I"), and avoid symbols (`%`, `&`, `/`, `~`, `→`).
- Repeat the key number or conclusion at the end. Repetition is a feature in audio.
- Name people in full the first time; avoid "the former" and "the latter".
- Target length: 1,300–1,800 words (9–12 minutes) unless the user asks for something else.
- No "welcome to the show" intro and no sign-off.

## Accuracy

- Check the premises the user gives you; say in the episode when one turns out to be wrong or distorted.
- Separate allegation from established fact, in the script as well as the notes.
- If something could not be verified, say so in both files.

## Files

- `podcast-tools/setup.sh` – installs Kokoro into `~/.cache/kokoro`
- `podcast-tools/make_episode.py` – script → MP3 + `episode.json`
- `podcast-tools/add_to_feed.py` – merges episodes into the published feed (run by the workflow)
- `.github/workflows/publish-episode.yml` – publishes on push
