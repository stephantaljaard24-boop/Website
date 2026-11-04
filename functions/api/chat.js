import { answer } from '../_lib/answer.js';
import { rateLimit } from '../_lib/ratelimit.js';

const ALLOWED_ORIGINS = [
  'https://stephantaljaard.com',
  'https://www.stephantaljaard.com',
  'https://consulting.stephantaljaard.com'
];

// Requests per IP per minute.
const RATE_LIMIT = 12;

function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Content-Type': 'application/json',
    'Vary': 'Origin'
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  return headers;
}

function json(request, data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(request) });
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json(request, { error: 'Invalid JSON body' }, 400);
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json(request, { error: 'messages array required' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!(await rateLimit(env, `web:${ip}`, RATE_LIMIT, 60))) {
    return json(request, { error: 'Too many messages — please wait a minute and try again.' }, 429);
  }

  try {
    const text = await answer({ messages: body.messages, channel: 'web', env });
    // Same response shape the widget already reads: data.choices[0].message.content
    return json(request, { choices: [{ message: { role: 'assistant', content: text } }] });
  } catch (err) {
    console.error('chat error:', err.message);
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    const message = status === 429
      ? 'The assistant is busy right now — please try again shortly.'
      : 'The assistant is unavailable right now. Please email stephantaljaard24@gmail.com.';
    return json(request, { error: message }, status);
  }
}
