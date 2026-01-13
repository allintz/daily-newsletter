# GitHub Actions Setup Guide

This guide will help you move your newsletter automation to GitHub Actions so it runs in the cloud.

## Prerequisites

You need to create a new GitHub repository for the newsletter automation code (separate from the newsletters output repository).

## Step 1: Create a New GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "daily-newsletter-automation")
3. Make it **private** (to protect your API keys)
4. Don't initialize with README, .gitignore, or license (we already have these)

## Step 2: Create a Personal Access Token (PAT)

This allows GitHub Actions to push to your newsletters repository.

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "Newsletter Automation"
4. Set expiration: "No expiration" (or 1 year if you prefer)
5. Select scopes:
   - ✅ `repo` (all repo permissions)
   - ✅ `workflow`
6. Click "Generate token"
7. **COPY THE TOKEN** - you won't see it again!

## Step 3: Add Secrets to Your Repository

1. Go to your new repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" and add these three secrets:

### Secret 1: `GH_PAT`
- **Value:** Paste the Personal Access Token from Step 2

### Secret 2: `ANTHROPIC_API_KEY`
- **Value:** Your Anthropic API key (starts with `sk-ant-`)

### Secret 3: `NTFY_TOPIC`
- **Value:** `democracy-alex-2026`

## Step 4: Push Your Code to GitHub

Run these commands in your terminal:

```bash
cd "/Users/alexl/Documents/Claude project 1/daily-newsletter"
git add .
git commit -m "Initial commit with GitHub Actions workflow"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-NEW-REPO-NAME.git
git push -u origin main
```

## Step 5: Test the Workflow

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Click "Daily Newsletter" workflow
4. Click "Run workflow" → "Run workflow" button
5. Watch it run! It should:
   - Generate the newsletter
   - Push it to your newsletters repository
   - Send you a notification

## Step 6: Verify It Works

1. Check that you received a notification on your phone
2. Click the notification - it should open the newsletter in your browser
3. Verify the newsletter appears at: https://allintz.github.io/democracy-newsletter/

## Step 7: Disable Local Cron Job

Once you verify GitHub Actions is working, disable your local cron job:

```bash
crontab -e
# Delete or comment out the newsletter line
```

Or remove it completely:
```bash
crontab -l | grep -v "send-newsletter.js" | crontab -
```

## Schedule

The workflow runs at **8:00 AM EST (13:00 UTC)** every day automatically.

## Troubleshooting

### Newsletter doesn't generate
- Check the Actions logs for errors
- Verify all three secrets are set correctly

### Can't push to newsletters repository
- Verify the `GH_PAT` token has `repo` scope
- Check that the token hasn't expired

### Notification doesn't arrive
- Verify `NTFY_TOPIC` secret is correct
- Test manually by going to Actions → Run workflow

## Manual Testing

You can manually trigger the workflow anytime:
1. Go to Actions tab
2. Select "Daily Newsletter"
3. Click "Run workflow"
