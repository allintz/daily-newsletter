#!/usr/bin/env node

const Anthropic = require('@anthropic-ai/sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

async function simplifyForAudio(content, anthropic) {
  console.log('Simplifying newsletter for audio...');

  const prompt = `You are adapting a written newsletter for audio/podcast format.

Take this newsletter and rewrite it to be optimal for listening:

1. Remove inline citations (like [Author 2020])
2. Convert references to links into phrases like "see the show notes for more" or "there's a link in the description"
3. Add natural transitions between sections (e.g., "Let's move on to...", "Now, turning to...", "Here's what's interesting...")
4. Keep the conversational, engaging tone but make it flow naturally when spoken
5. Preserve all the key information and nuance
6. DO NOT add an introduction like "Welcome to..." or "This is..." - just start with the content
7. DO NOT add a conclusion or sign-off - just end naturally
8. IMPORTANT: Keep it under 9,000 characters. Condense if needed while preserving key insights.

Original newsletter:
${content}

Provide the audio-optimized version (under 9,000 characters):`;

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

async function generateAudio(text, outputPath) {
  if (!config.elevenlabs_api_key || config.elevenlabs_api_key.includes('YOUR-API-KEY')) {
    console.log('\n⚠️  ElevenLabs not configured. Skipping audio generation.');
    console.log('Audio would be generated from:');
    console.log(text.substring(0, 200) + '...\n');
    return null;
  }

  console.log('Generating audio with ElevenLabs...');

  // Using "Adam" voice - professional male voice
  // You can change this to any voice ID from ElevenLabs
  const voiceId = config.elevenlabs_voice_id || 'pNInz6obpgDQGcFmaJgB'; // Adam

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': config.elevenlabs_api_key
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} ${error}`);
  }

  const buffer = await response.buffer();
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ Audio generated: ${outputPath}`);
  return outputPath;
}

function getAudioDuration(filePath) {
  // Simple estimate: ~150 words per minute for TTS
  // For actual duration, we'd need to use ffprobe or similar
  // This is a placeholder - will be accurate enough for RSS feed
  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);
  // Rough estimate: 1MB ≈ 1 minute of audio at 128kbps
  const estimatedMinutes = Math.ceil(fileSizeInMB);
  return estimatedMinutes * 60; // return seconds
}

async function updateRSSFeed(audioFileName, title, description, date) {
  console.log('Updating RSS feed...');

  const podcastDir = path.join(__dirname, 'podcast');
  if (!fs.existsSync(podcastDir)) {
    fs.mkdirSync(podcastDir, { recursive: true });
  }

  const rssPath = path.join(podcastDir, 'feed.xml');
  const audioUrl = `${config.podcast.base_url}/${audioFileName}`;
  const audioPath = path.join(podcastDir, audioFileName);

  let duration = 300; // default 5 minutes
  if (fs.existsSync(audioPath)) {
    duration = getAudioDuration(audioPath);
  }

  const fileSize = fs.existsSync(audioPath) ? fs.statSync(audioPath).size : 0;

  // Read existing feed or create new one
  let existingItems = [];
  if (fs.existsSync(rssPath)) {
    const existingFeed = fs.readFileSync(rssPath, 'utf8');
    // Extract existing items (simple regex - not perfect but works)
    const itemMatches = existingFeed.match(/<item>[\s\S]*?<\/item>/g);
    if (itemMatches) {
      existingItems = itemMatches;
    }
  }

  // Create new item
  const newItem = `    <item>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <pubDate>${new Date(date).toUTCString()}</pubDate>
      <enclosure url="${audioUrl}" length="${fileSize}" type="audio/mpeg"/>
      <guid isPermaLink="false">${audioFileName}</guid>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:explicit>false</itunes:explicit>
    </item>`;

  // Combine new item with existing items
  const allItems = [newItem, ...existingItems].join('\n');

  // Create complete RSS feed
  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Deep Democracy Learning</title>
    <link>${config.podcast.base_url}</link>
    <description>Daily audio briefing on voter subversion, election integrity, and threats to democracy in America</description>
    <language>en-us</language>
    <itunes:author>Democracy Watch</itunes:author>
    <itunes:category text="News">
      <itunes:category text="Politics"/>
    </itunes:category>
    <itunes:explicit>false</itunes:explicit>
    <itunes:image href="${config.podcast.base_url}/artwork.jpg"/>
    <image>
      <url>${config.podcast.base_url}/artwork.jpg</url>
      <title>Deep Democracy Learning</title>
      <link>${config.podcast.base_url}</link>
    </image>
${allItems}
  </channel>
</rss>`;

  fs.writeFileSync(rssPath, rssFeed);
  console.log(`✅ RSS feed updated: ${rssPath}`);

  return rssPath;
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  try {
    const date = new Date().toISOString().split('T')[0];
    const newsletterPath = path.join(__dirname, 'newsletters', `${date}.txt`);

    if (!fs.existsSync(newsletterPath)) {
      console.error(`❌ Newsletter not found: ${newsletterPath}`);
      console.log('Run send-newsletter.js first to generate the newsletter.');
      process.exit(1);
    }

    console.log('Starting podcast generation...\n');

    // Read newsletter content
    const content = fs.readFileSync(newsletterPath, 'utf8');

    // Initialize Anthropic for simplification
    const anthropic = new Anthropic({
      apiKey: config.anthropic_api_key,
    });

    // Simplify for audio
    const audioText = await simplifyForAudio(content, anthropic);

    // Extract title from content
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    let title = 'Deep Democracy Learning';
    for (const line of lines) {
      if (line.startsWith('# ')) {
        title = line.substring(2).trim();
        break;
      } else if (line.startsWith('## ')) {
        title = line.substring(3).trim();
        break;
      }
    }

    // Generate audio
    const podcastDir = path.join(__dirname, 'podcast');
    if (!fs.existsSync(podcastDir)) {
      fs.mkdirSync(podcastDir, { recursive: true });
    }

    const audioFileName = `${date}.mp3`;
    const audioPath = path.join(podcastDir, audioFileName);

    await generateAudio(audioText, audioPath);

    // Create brief description for RSS
    const description = audioText.substring(0, 200).trim() + '...';

    // Update RSS feed
    await updateRSSFeed(audioFileName, title, description, date);

    console.log('\n✅ Podcast episode generated successfully!');
    console.log(`📄 Audio: ${audioPath}`);
    console.log(`📡 RSS feed: ${path.join(podcastDir, 'feed.xml')}`);
    console.log(`\n🎧 Subscribe in Overcast with: ${config.podcast.base_url}/feed.xml`);

  } catch (error) {
    console.error('❌ Error generating podcast:', error);
    process.exit(1);
  }
}

main();
