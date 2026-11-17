// Shared helper for calling Claude. The model thinks before answering, so the
// response can contain non-text blocks; only the text blocks are returned.
const MODEL = 'claude-sonnet-5-5';

async function askClaude(anthropic, prompt, maxTokens = 16000) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
    .trim();

  if (!text) {
    throw new Error(`Claude returned no text (stop_reason: ${message.stop_reason})`);
  }
  return text;
}

module.exports = { askClaude, MODEL };
