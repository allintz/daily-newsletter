# Quick Deploy to GitHub Actions - Step by Step

Follow these steps exactly to move your newsletter to the cloud:

## Step 1: Create GitHub Repository (2 minutes)

1. Go to: https://github.com/new
2. Repository name: `daily-newsletter-automation` (or anything you like)
3. **IMPORTANT: Select "Private"** (to keep your API keys safe)
4. Leave all checkboxes UNCHECKED (don't add README, .gitignore, or license)
5. Click "Create repository"

## Step 2: Create Personal Access Token (2 minutes)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `Newsletter Automation`
4. Expiration: Select "No expiration" (or "1 year" if you prefer)
5. Check these boxes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows)
6. Scroll down and click "Generate token"
7. **COPY THE TOKEN NOW** - looks like `ghp_xxxxxxxxxxxx`
   - Save it somewhere temporarily - you won't see it again!

## Step 3: Push Code to GitHub (1 minute)

Open Terminal and run these commands (replace YOUR-USERNAME and YOUR-REPO-NAME):

```bash
cd "/Users/alexl/Documents/Claude project 1/daily-newsletter"
git commit -m "Initial commit with GitHub Actions"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

Example:
```bash
git remote add origin https://github.com/allintz/daily-newsletter-automation.git
git push -u origin main
```

## Step 4: Add Secrets to GitHub (3 minutes)

1. Go to your new repository on GitHub
2. Click "Settings" (top menu)
3. Click "Secrets and variables" → "Actions" (left sidebar)
4. Click "New repository secret" button

Add these THREE secrets one by one:

### Secret #1: GH_PAT
- Name: `GH_PAT`
- Value: Paste the token you copied in Step 2 (the `ghp_xxxxx` token)
- Click "Add secret"

### Secret #2: ANTHROPIC_API_KEY
- Name: `ANTHROPIC_API_KEY`
- Value: Your Anthropic API key (starts with `sk-ant-api03-`)
- Click "Add secret"

### Secret #3: NTFY_TOPIC
- Name: `NTFY_TOPIC`
- Value: `democracy-alex-2026`
- Click "Add secret"

## Step 5: Test It! (2 minutes)

1. In your repository, click the "Actions" tab (top menu)
2. Click "Daily Newsletter" on the left
3. Click the "Run workflow" button (on the right)
4. Click the green "Run workflow" button in the dropdown
5. Wait about 30-60 seconds
6. You should see a green checkmark ✅
7. Check your phone - you should have received a notification!
8. Click the notification - it should open the newsletter

## Step 6: Remove Local Cron Job (30 seconds)

Since GitHub Actions will now handle it:

```bash
crontab -l | grep -v "send-newsletter.js" | crontab -
```

Verify it's gone:
```bash
crontab -l
```

## Done! 🎉

From now on:
- Newsletter will generate automatically every day at 8:00 AM EST
- No need for your computer to be on
- Runs reliably from GitHub's servers
- You can manually trigger it anytime from Actions tab

## Troubleshooting

### "Permission denied" when pushing
Run: `git push --set-upstream origin main`

### Workflow fails with "authentication" error
- Check that GH_PAT secret is set correctly
- Make sure the PAT has `repo` and `workflow` scopes

### No notification received
- Check that NTFY_TOPIC matches your ntfy subscription exactly
- Try resubscribing in the ntfy app

### Newsletter link shows 404
- Wait 5-10 minutes for GitHub Pages to deploy
- Check that the workflow completed successfully (green checkmark)

---

**Need help?** Check the Actions logs:
1. Go to Actions tab
2. Click on the failed run
3. Click on the job
4. Expand the failed step to see error details
