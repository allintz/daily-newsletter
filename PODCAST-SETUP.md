# Podcast Setup Guide - "Deep Democracy Learning"

Your newsletter now has an audio version! Every morning, your newsletter is automatically converted to a podcast episode.

## Quick Setup (5 minutes)

### Step 1: Get ElevenLabs API Key

1. Go to: https://elevenlabs.io/
2. Sign up for a free account
3. Click your profile icon → "Profile + API key"
4. Copy your API key
5. **Free tier:** 10,000 characters/month (~2-3 newsletters)
6. **Recommended:** $5/month for 30,000 chars (~7 newsletters), or $22/month for 100k chars (daily use)

### Step 2: Add API Key to GitHub

1. Go to: https://github.com/allintz/daily-newsletter/settings/secrets/actions
2. Click "New repository secret"
3. Name: `ELEVENLABS_API_KEY`
4. Value: Paste your ElevenLabs API key
5. Click "Add secret"

### Step 3: Test It

1. Go to: https://github.com/allintz/daily-newsletter/actions
2. Click "Daily Newsletter"
3. Click "Run workflow"
4. Wait ~2 minutes for completion
5. Verify: https://allintz.github.io/democracy-newsletter/podcast/feed.xml

### Step 4: Subscribe in Overcast

1. Open Overcast app
2. Tap "+" to add podcast
3. Tap "Add URL"
4. Enter: `https://allintz.github.io/democracy-newsletter/podcast/feed.xml`
5. Tap "Subscribe"

**Done!** New episodes appear automatically every morning at 8 AM EST.

## Features

- **Voice:** Professional male narrator (Adam from ElevenLabs)
- **Length:** 5-7 minutes
- **Optimized for listening:** Citations removed, transitions added
- **Compatible:** Works with any podcast app
- **Cost:** ~$0.28-0.65 per episode

## RSS Feed URL

```
https://allintz.github.io/democracy-newsletter/podcast/feed.xml
```

Add this to any podcast app!

## Cost Breakdown

- Newsletter text: $0.20/episode (Anthropic)
- Audio adaptation: $0.05/episode (Anthropic)
- Text-to-speech: $0.08-0.40/episode (ElevenLabs)

**Total:** ~$8-20/month for daily episodes

## Customization

### Change Voice

1. Browse voices: https://elevenlabs.io/voice-library
2. Copy voice ID
3. Update `elevenlabs_voice_id` in config.json or add as GitHub secret

Popular options:
- **Adam** (pNInz6obpgDQGcFmaJgB) - Professional male (default)
- **Rachel** (21m00Tcm4TlvDq8ikWAM) - Professional female
- **Antoni** (ErXwobaYiN019PkySvjV) - Storytelling male

## Troubleshooting

**No audio generated?**
- Check `ELEVENLABS_API_KEY` secret is set
- Verify ElevenLabs account has credits
- Check GitHub Actions logs for errors

**RSS feed not updating?**
- Overcast refreshes every few hours
- Try manual refresh (pull down)
- Verify feed URL is accessible

**Want custom artwork?**
- Create 3000x3000 JPG named `artwork.jpg`
- Place in `/podcast/` folder
- Commit and push

## How It Works

Every 8 AM EST:
1. Newsletter generates (text)
2. Claude simplifies for audio (removes citations, adds transitions)
3. ElevenLabs converts to speech
4. RSS feed updates automatically
5. Overcast downloads new episode

Simple and fully automated!
