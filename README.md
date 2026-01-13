# Daily Democracy Watch Newsletter

Automated daily newsletter system that sends you a **push notification** every morning at 8am with a link to a thoughtfully-written article about voter subversion, election integrity, and democratic backsliding.

## How It Works

1. **Every day at 8:00 AM EST**, a script runs automatically
2. Claude generates a ~5 minute read newsletter about your specified topics
3. Newsletter is saved as a beautiful HTML page and pushed to GitHub Pages
4. You receive a **push notification on your phone** with a link to read the full newsletter

**No SMS fees!** Uses free push notifications via ntfy.sh

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd daily-newsletter
npm install
```

### Step 2: Get Your Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

Edit `config.json` and add your key:
```json
{
  "anthropic_api_key": "sk-ant-your-actual-key-here"
}
```

### Step 3: Set Up Push Notifications (ntfy)

**ntfy** is a free, open-source push notification service. No account needed!

1. **Install the ntfy app on your phone**:
   - iOS: https://apps.apple.com/us/app/ntfy/id1625396347
   - Android: https://play.google.com/store/apps/details?id=io.heckel.ntfy

2. **Choose a unique topic name**:
   - This is like a channel ID - should be unique to avoid conflicts
   - Example: `democracy-watch-alex-2026` or `newsletter-abc123xyz`
   - Edit `config.json` and replace `YOUR-UNIQUE-ID`:
   ```json
   {
     "ntfy": {
       "topic": "democracy-watch-YOUR-UNIQUE-ID"
     }
   }
   ```

3. **Subscribe to your topic in the app**:
   - Open ntfy app
   - Tap "+" to add subscription
   - Enter your topic name (must match config.json exactly)
   - Enable notifications

### Step 4: Set Up GitHub Pages (Free Hosting)

This makes the newsletters accessible from your phone.

1. **Generate your first newsletter** (to create the newsletters folder):
   ```bash
   npm run test
   ```

2. **Run the deployment helper**:
   ```bash
   npm run deploy
   ```

3. **Follow the instructions** to create a GitHub repo and push your newsletters

4. **Update config.json** with your GitHub Pages URL:
   ```json
   {
     "hosting": {
       "method": "github-pages",
       "base_url": "https://YOUR-USERNAME.github.io/YOUR-REPO-NAME"
     }
   }
   ```

### Step 5: Test It

Run a test to make sure everything works:

```bash
npm run test
```

This will:
- Generate a newsletter (takes ~10-30 seconds)
- Save it to the `newsletters/` folder
- Show you what push notification would be sent (without sending it)
- You can open the HTML file to see the full newsletter

### Step 6: Install the Cron Job

Once you're happy with the test:

```bash
chmod +x install-cron.sh
./install-cron.sh
```

This sets up:
- Daily 8am execution
- Automatic git push to GitHub Pages after each newsletter

## Testing & Usage

### Test Without Sending Notification
```bash
npm run test
```

### Send Newsletter Immediately
```bash
npm run send
```

### View Logs
```bash
tail -f newsletter.log
```

### View Installed Cron Jobs
```bash
crontab -l
```

### Remove Cron Job
```bash
crontab -e
# Delete the line containing "send-newsletter.js"
```

## Configuration

Everything is pre-configured for you in `config.json`:
- **Topics**: Voter subversion, 2020/2022 election cases, political science research
- **Time**: 8:00 AM EST
- **Style**: EA Forum (fun to read, reasoning transparency)
- **Length**: ~5 minute read

### Customization Options

**Change topics**: Edit the `topics` array in `config.json`

**Change time**: Edit `send_time` in `config.json` (24-hour format), then reinstall cron

**Change writing style**: Edit `newsletter_style` in `config.json`

**Change notification priority**: Edit `ntfy.priority` in `config.json` (options: `min`, `low`, `default`, `high`, `urgent`)

## File Structure

```
daily-newsletter/
├── config.json              # Your configuration & API keys
├── send-newsletter.js       # Main script
├── deploy-to-github.js      # GitHub Pages setup helper
├── install-cron.sh          # Cron installation script
├── package.json             # Dependencies
├── newsletter.log           # Execution logs (created after first run)
└── newsletters/             # Newsletter archive (created after first run)
    ├── index.html           # Archive homepage
    ├── 2026-01-12.html      # Daily newsletters
    └── ...
```

## How Push Notifications Work

**ntfy** works by publishing messages to topics (like channels). When you:
1. Subscribe to a topic in the ntfy app
2. The script publishes a message to that topic
3. Your phone instantly receives the notification

**Privacy**:
- Messages are delivered through ntfy.sh servers (open source, run by the community)
- No account or email required
- Messages are not stored after delivery
- Your topic name acts as a "password" - keep it unique to avoid conflicts

## Cost Breakdown

- **Anthropic API**: ~$0.15-0.30 per newsletter (30 newsletters = $4.50-9/month)
- **ntfy push notifications**: FREE
- **GitHub Pages**: FREE
- **Total**: ~$5-9/month (just Claude API)

**Much cheaper than SMS!** (SMS would cost ~$1.24/month extra via Twilio)

## Troubleshooting

### Newsletter not generating?
1. Check logs: `cat newsletter.log`
2. Verify Anthropic API key in config.json
3. Check API credits: https://console.anthropic.com/

### Cron not running?
1. Verify cron is running: `crontab -l`
2. Make sure your computer is awake at 8am
3. Check logs: `cat newsletter.log`

### Push notification not arriving?
1. Run `npm run send` manually to test
2. Verify your topic name matches exactly in both config.json and ntfy app
3. Check notification permissions in your phone settings
4. Try unsubscribing and resubscribing in the ntfy app

### Newsletter link not working on phone?
1. Make sure you completed GitHub Pages setup
2. Verify the `base_url` in config.json matches your actual GitHub Pages URL
3. Check that the git push succeeded (look in newsletter.log)

## Privacy & Security

- **Anthropic API key**: Stored locally in `config.json`
- **ntfy topic**: Keep it unique and don't share it publicly (anyone who knows it can send you notifications)
- **GitHub Pages**: Newsletters are publicly accessible if someone knows the URL
  - If you want private hosting, you can use GitHub private repos + GitHub Actions instead
- **No third-party data sharing**: Only Anthropic (for generation) and ntfy.sh (for notifications)

## Advanced Options

### Make Newsletters Private

If you don't want your newsletters publicly accessible:

1. Create a **private** GitHub repository
2. Use GitHub Actions to build and host internally
3. Or use a different hosting method (Cloudflare Pages supports private repos)

### Use a Different Notification Service

Instead of ntfy, you can use:
- **Pushover** ($5 one-time fee, more reliable, prettier notifications)
- **Pushbullet** (free tier available)
- **iOS Shortcuts** (iOS only, requires some setup)

Let me know if you want help setting up any of these alternatives!

### Weekly Instead of Daily

Edit cron schedule:
- Every Monday at 8am: `0 8 * * 1`
- Every Sunday at 9am: `0 9 * * 0`

### Multiple Recipients

Create multiple ntfy topics and subscribe different people to each, or create a shared topic everyone can subscribe to.

## Support

If you need help or want to modify the system, just ask! Common modifications:
- Change notification service
- Add email as backup delivery
- Customize HTML styling
- Add images or charts
- Different topics per day of week
- Make newsletters private
