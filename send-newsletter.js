#!/usr/bin/env node

const Anthropic = require('@anthropic-ai/sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

// Check if this is a test run
const isTest = process.argv.includes('--test');

function getRecentTopics() {
  const summariesPath = path.join(__dirname, 'newsletter-summaries.json');

  if (!fs.existsSync(summariesPath)) {
    return [];
  }

  const summaries = JSON.parse(fs.readFileSync(summariesPath, 'utf8'));

  // Get last 7 summaries
  const dates = Object.keys(summaries).sort().reverse().slice(0, 7);

  return dates.map(date => `- ${date}: ${summaries[date]}`);
}

async function generateSummary(content, anthropic) {
  // Generate a 2-sentence summary of the newsletter
  const summaryPrompt = `Read this newsletter and provide a 2-sentence summary that captures the main topic and key takeaway. Be specific and concise.

Newsletter:
${content}

Provide only the 2-sentence summary, nothing else:`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: summaryPrompt
      }
    ]
  });

  return message.content[0].text.trim();
}

function saveSummary(date, summary) {
  const summariesPath = path.join(__dirname, 'newsletter-summaries.json');

  let summaries = {};
  if (fs.existsSync(summariesPath)) {
    summaries = JSON.parse(fs.readFileSync(summariesPath, 'utf8'));
  }

  summaries[date] = summary;

  fs.writeFileSync(summariesPath, JSON.stringify(summaries, null, 2));
}

async function generateNewsletter() {
  console.log('Generating newsletter content...');

  const anthropic = new Anthropic({
    apiKey: config.anthropic_api_key,
  });

  // Load prompt template
  const templatePath = path.join(__dirname, 'prompt-template.txt');
  let promptTemplate;

  if (fs.existsSync(templatePath)) {
    promptTemplate = fs.readFileSync(templatePath, 'utf8');
  } else {
    // Fallback to default prompt if template doesn't exist
    promptTemplate = `You are writing a daily newsletter for someone deeply interested in understanding threats to democracy, specifically:

{{TOPICS}}

Write today's newsletter in the following style: {{STYLE}}

Requirements:
- Target reading time: {{READ_TIME}}
- Use clear reasoning and evidence-based analysis with good reasoning transparency
- Include specific examples, cases, or papers when relevant with proper context
- Make it engaging and worth reading - use a conversational but informed tone
- Use EA Forum conventions: clear structure, numbered points where helpful, epistemic status if uncertain
- Focus on one main topic or theme per day, explored in depth with nuance
- Include a "Bottom line" or "Key takeaway" section at the end
- Current date: {{DATE}}

{{RECENT_TOPICS}}

Write the full newsletter now:`;
  }

  // Build recent topics text
  const recentTopics = getRecentTopics();
  const recentTopicsText = recentTopics.length > 0
    ? `Recent topics you've already covered (DO NOT repeat these):\n${recentTopics.join('\n')}`
    : '';

  // Replace template variables
  const prompt = promptTemplate
    .replace('{{TOPICS}}', config.topics.map(t => `- ${t}`).join('\n'))
    .replace('{{STYLE}}', config.newsletter_style)
    .replace('{{READ_TIME}}', config.target_read_time)
    .replace('{{DATE}}', new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    .replace('{{RECENT_TOPICS}}', recentTopicsText);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  return message.content[0].text;
}

function convertMarkdownLinks(text) {
  // Convert markdown links [text](url) to HTML anchor tags
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function convertMarkdownBold(text) {
  // Convert **bold** to <strong>bold</strong>
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function convertMarkdownItalic(text) {
  // Convert *italic* to <em>italic</em> (but not already processed bold)
  return text.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
}

function convertMarkdownInline(text) {
  // Apply all inline markdown conversions
  let result = text;
  result = convertMarkdownBold(result);
  result = convertMarkdownItalic(result);
  result = convertMarkdownLinks(result);
  return result;
}

function createHTMLNewsletter(content, date) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Newsletter - ${date}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 700px;
            margin: 40px auto;
            padding: 0 20px;
            color: #333;
            background-color: #fafafa;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #2c5282;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            color: #2c5282;
            margin-bottom: 10px;
        }
        .date {
            color: #718096;
            font-size: 0.9em;
        }
        h2 {
            color: #2d3748;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h3 {
            color: #4a5568;
            margin-top: 20px;
        }
        p {
            margin-bottom: 15px;
        }
        a {
            color: #2c5282;
            text-decoration: underline;
        }
        a:hover {
            color: #1a365d;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 0.9em;
        }
        ul, ol {
            margin-bottom: 15px;
        }
        li {
            margin-bottom: 8px;
        }
        blockquote {
            border-left: 4px solid #2c5282;
            padding-left: 20px;
            margin: 20px 0;
            color: #4a5568;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Democracy Watch Newsletter</h1>
            <div class="date">${date}</div>
        </div>
        <div class="content">
${content.split('\n').map(line => {
    // Convert markdown-style headers to HTML
    if (line.startsWith('# ')) {
        return `            <h1>${convertMarkdownInline(line.substring(2))}</h1>`;
    } else if (line.startsWith('## ')) {
        return `            <h2>${convertMarkdownInline(line.substring(3))}</h2>`;
    } else if (line.startsWith('### ')) {
        return `            <h3>${convertMarkdownInline(line.substring(4))}</h3>`;
    } else if (line.trim() === '') {
        return '';
    } else if (line.match(/^\d+\./)) {
        // Handle numbered lists (basic implementation)
        return `            <li>${convertMarkdownInline(line.substring(line.indexOf('.') + 1).trim())}</li>`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Handle bullet lists
        return `            <li>${convertMarkdownInline(line.substring(2))}</li>`;
    } else if (line.trim().length > 0) {
        return `            <p>${convertMarkdownInline(line)}</p>`;
    }
    return line;
}).join('\n')}
        </div>
        <div class="footer">
            Generated daily at ${config.send_time} ${config.timezone}
        </div>
    </div>
</body>
</html>`;

  return html;
}

function saveNewsletter(content, htmlContent) {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];

  // Ensure newsletters directory exists
  const newslettersDir = path.join(__dirname, 'newsletters');
  if (!fs.existsSync(newslettersDir)) {
    fs.mkdirSync(newslettersDir, { recursive: true });
  }

  // Save plain text version
  const txtPath = path.join(newslettersDir, `${dateStr}.txt`);
  fs.writeFileSync(txtPath, content);

  // Save HTML version
  const htmlPath = path.join(newslettersDir, `${dateStr}.html`);
  fs.writeFileSync(htmlPath, htmlContent);

  // Create/update index.html with links to all newsletters
  updateIndexPage(newslettersDir);

  console.log(`Newsletter saved to ${htmlPath}`);

  return {
    txtPath,
    htmlPath,
    date: dateStr
  };
}

function updateIndexPage(newslettersDir) {
  // Get all HTML files except index.html
  const files = fs.readdirSync(newslettersDir)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort()
    .reverse(); // Most recent first

  const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Democracy Watch Newsletter Archive</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 700px;
            margin: 40px auto;
            padding: 0 20px;
            color: #333;
            background-color: #fafafa;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c5282;
            border-bottom: 2px solid #2c5282;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .newsletter-list {
            list-style: none;
            padding: 0;
        }
        .newsletter-list li {
            margin-bottom: 15px;
        }
        .newsletter-list a {
            color: #2c5282;
            text-decoration: none;
            font-size: 1.1em;
            display: block;
            padding: 15px;
            background: #f7fafc;
            border-radius: 6px;
            transition: background 0.2s;
        }
        .newsletter-list a:hover {
            background: #edf2f7;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Democracy Watch Newsletter Archive</h1>
        <ul class="newsletter-list">
${files.map(file => {
    const date = file.replace('.html', '');
    const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return `            <li><a href="${file}">${formattedDate}</a></li>`;
}).join('\n')}
        </ul>
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(newslettersDir, 'index.html'), indexHTML);
}

function generateTitle(content) {
  // Extract title from first header or first meaningful line
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();
    } else if (line.startsWith('## ')) {
      return line.substring(3).trim();
    }
  }

  // Fallback: use first sentence
  for (const line of lines) {
    if (!line.startsWith('#') && line.length > 20) {
      const firstSentence = line.split('.')[0];
      return firstSentence.length > 60 ? firstSentence.substring(0, 57) + '...' : firstSentence;
    }
  }

  return 'Today\'s Democracy Watch';
}

async function sendPushNotification(title, message, url) {
  if (!config.ntfy || !config.ntfy.topic || config.ntfy.topic.includes('YOUR-UNIQUE-ID')) {
    console.log('\n⚠️  ntfy not configured. Push notification would send:');
    console.log('─────────────────────────────────');
    console.log(`Title: ${title}`);
    console.log(`Message: ${message}`);
    console.log(`URL: ${url}`);
    console.log('─────────────────────────────────\n');
    return;
  }

  const ntfyUrl = `${config.ntfy.server}/${config.ntfy.topic}`;

  try {
    const response = await fetch(ntfyUrl, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': config.ntfy.priority || 'default',
        'Click': url,
        'Actions': `view, Open Newsletter, ${url}, clear=true`,
        'Tags': 'books,newspaper'
      },
      body: message
    });

    if (response.ok) {
      console.log('✅ Push notification sent successfully!');
    } else {
      console.error('❌ Error sending push notification:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting daily newsletter generation...\n');

    if (isTest) {
      console.log('🧪 TEST MODE - Push notification will be simulated, newsletter will still be generated\n');
    }

    // Generate newsletter content
    const content = await generateNewsletter();

    // Create HTML version
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const htmlContent = createHTMLNewsletter(content, date);

    // Save newsletter
    const { htmlPath, date: dateStr } = saveNewsletter(content, htmlContent);

    // Generate and save 2-sentence summary
    console.log('Generating newsletter summary...');
    const anthropic = new Anthropic({
      apiKey: config.anthropic_api_key,
    });
    const summary = await generateSummary(content, anthropic);
    saveSummary(dateStr, summary);
    console.log(`Summary saved: ${summary}`);

    // Generate title and notification
    const title = generateTitle(content);
    const notificationMessage = 'Your daily newsletter on democracy and election integrity is ready to read.';

    // Construct URL
    let newsletterUrl;
    if (config.hosting.method === 'github-pages' && !config.hosting.base_url.includes('YOUR-USERNAME')) {
      newsletterUrl = `${config.hosting.base_url}/${dateStr}.html`;
    } else {
      // Fallback to local file URL
      newsletterUrl = `file://${htmlPath}`;
    }

    // Send push notification
    await sendPushNotification(title, notificationMessage, newsletterUrl);

    console.log('\n✅ Newsletter generated and notification sent!');
    console.log(`📄 View at: ${htmlPath}`);
    if (newsletterUrl.startsWith('http')) {
      console.log(`🌐 Public URL: ${newsletterUrl}`);
    }

  } catch (error) {
    console.error('❌ Error generating/sending newsletter:', error);
    process.exit(1);
  }
}

main();
