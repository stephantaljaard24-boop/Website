import { verifySignature } from '../_lib/whatsapp.js';
import { processPayload } from '../_lib/webhook.js';

// GET — Meta's one-time webhook verification handshake.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && env.WHATSAPP_VERIFY_TOKEN && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// POST — incoming messages and events. Must return 200 quickly; work continues in waitUntil.
export async function onRequestPost({ request, env, waitUntil }) {
  const raw = await request.text();

  const ok = await verifySignature(raw, request.headers.get('X-Hub-Signature-256'), env.WHATSAPP_APP_SECRET);
  if (!ok) {
    console.warn('WhatsApp webhook rejected: invalid or missing signature (check WHATSAPP_APP_SECRET)');
    return new Response('Invalid signature', { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  waitUntil(processPayload(env, payload));
  return new Response('OK', { status: 200 });
}
