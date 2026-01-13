# Quick Start Guide

Get your daily democracy newsletter up and running in 10 minutes!

## 1. Install (2 min)

```bash
cd daily-newsletter
npm install
```

## 2. Configure Anthropic API (3 min)

Get your API key from https://console.anthropic.com/ and add it to `config.json`:

```json
{
  "anthropic_api_key": "sk-ant-YOUR-KEY-HERE"
}
```

## 3. Set Up ntfy Push Notifications (3 min)

**On your phone:**
1. Install ntfy app:
   - iOS: https://apps.apple.com/us/app/ntfy/id1625396347
   - Android: https://play.google.com/store/apps/details?id=io.heckel.ntfy

2. Open app, tap "+", subscribe to a unique topic like: `democracy-alex-2026`

**On your computer:**
Edit `config.json` to match your topic:
```json
{
  "ntfy": {
    "topic": "democracy-alex-2026"
  }
}
```

## 4. Test It (1 min)

```bash
npm run test
```

You should see:
- Newsletter generated (~10-30 seconds)
- HTML file created in `newsletters/` folder
- Push notification simulation (won't actually send in test mode)

Open the HTML file to read your first newsletter!

## 5. Send Real Notification (1 min)

```bash
npm run send
```

Check your phone - you should get a notification! (The link won't work yet, that's next)

## 6. Set Up GitHub Pages (Optional but Recommended)

Follow the detailed instructions in README.md to:
1. Create a GitHub repo for your newsletters
2. Push the newsletters folder
3. Enable GitHub Pages
4. Update the `base_url` in config.json

This makes the links in your notifications work on your phone!

## 7. Automate with Cron

```bash
chmod +x install-cron.sh
./install-cron.sh
```

Done! You'll get a notification every morning at 8am EST.

---

## Quick Reference

**Test without notification:** `npm run test`
**Send immediately:** `npm run send`
**View logs:** `cat newsletter.log`
**Check cron:** `crontab -l`

Need help? See README.md for full documentation.
