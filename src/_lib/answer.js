import { buildSystemPrompt } from './prompt.js';

// OpenRouter retired the free variant, so the default is the paid slug. Override with a
// MODEL environment variable if you want a different model (no code change needed).
export const DEFAULT_MODEL = 'openai/gpt-oss-120b';

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

// Keep only user/assistant turns so a client can never inject its own system prompt.
export function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
}

/**
 * The one place that talks to the LLM. Used by the website chat and WhatsApp.
 * Returns the reply text, or throws an Error (with .status) if the model call fails.
 */
export async function answer({ messages, channel = 'web', env }) {
  const clean = sanitizeMessages(messages);
  if (clean.length === 0) throw Object.assign(new Error('No messages'), { status: 400 });
  if (!env.OPENROUTER_API_KEY) throw Object.assign(new Error('API key not configured'), { status: 500 });

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://stephantaljaard.com',
      'X-Title': 'Stephan Taljaard - Digital Twin'
    },
    body: JSON.stringify({
      model: env.MODEL || DEFAULT_MODEL,
      messages: [{ role: 'system', content: buildSystemPrompt(channel) }, ...clean]
    })
  });

  let data;
  try { data = await upstream.json(); } catch { data = null; }

  const text = data?.choices?.[0]?.message?.content;
  if (!upstream.ok || typeof text !== 'string' || !text.trim()) {
    const detail = data?.error?.message || `upstream status ${upstream.status}`;
    throw Object.assign(new Error(detail), { status: upstream.status === 200 ? 502 : upstream.status });
  }
  return text.trim();
}
