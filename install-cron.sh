#!/bin/bash

# Installation script for daily newsletter cron job
# This sets up a cron job to run at 8:00 AM EST daily

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SEND_SCRIPT="$SCRIPT_DIR/send-newsletter.js"

echo "Setting up daily newsletter cron job..."
echo "Script location: $SEND_SCRIPT"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js and try again"
    exit 1
fi

NODE_PATH=$(which node)
echo "✓ Node.js found at: $NODE_PATH"

# Create cron command - includes git push for GitHub Pages if using hosting
# If you set up GitHub Pages, you may want to add git commands after the script
CRON_CMD="0 8 * * * cd $SCRIPT_DIR && $NODE_PATH $SEND_SCRIPT >> $SCRIPT_DIR/newsletter.log 2>&1 && cd $SCRIPT_DIR/newsletters && git add . && git commit -m \"Daily newsletter \$(date +\%Y-\%m-\%d)\" && git push 2>> $SCRIPT_DIR/newsletter.log || true"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "send-newsletter.js"; then
    echo ""
    echo "⚠️  A cron job for send-newsletter.js already exists."
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
    # Remove existing cron job
    crontab -l 2>/dev/null | grep -v "send-newsletter.js" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo ""
echo "✅ Cron job installed successfully!"
echo ""
echo "The newsletter will be sent daily at 8:00 AM EST"
echo "Logs will be written to: $SCRIPT_DIR/newsletter.log"
echo ""
echo "To view current cron jobs: crontab -l"
echo "To remove this cron job: crontab -e (then delete the line with send-newsletter.js)"
echo ""
echo "Note: Make sure to configure your API keys in config.json before the first run!"
