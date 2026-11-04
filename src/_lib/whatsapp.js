// Helpers for the WhatsApp Cloud API webhook. Kept separate from the route file
// so they can be unit-tested.

const GRAPH_VERSION = 'v25.0';
export const HISTORY_TURNS = 10;          // user+assistant pairs kept per customer
export const HISTORY_TTL = 60 * 60 * 24;  // 24h (matches the WhatsApp service window)
export const PAUSE_TTL = 60 * 60 * 12;    // bot stays silent 12h after Stephan replies manually
export const SEEN_TTL = 60 * 60 * 24;
export const ALERT_COOLDOWN = 60 * 60 * 6;

export const NON_TEXT_REPLY = "Thanks for your message! I can only read text messages here — could you type your question? You can also reach me at stephantaljaard24@gmail.com.";
export const FALLBACK_REPLY = "Thanks for your message — I'm having a technical hiccup. I'll reply to you personally as soon as I can. You can also email me at stephantaljaard24@gmail.com.";

const LEAD_RE = /\b(pric|cost|rate|quote|quotation|budget|book|call|meeting|meet|availab|hire|hiring|engage|proposal|project|consult|contract|schedule|demo)\w*/i;

export function isLead(text) {
  return LEAD_RE.test(text || '');
}

// ── Signature verification (X-Hub-Signature-256) ─────────────────────
export async function verifySignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret || !signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const expected = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
  const given = signatureHeader.slice('sha256='.length);
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

// ── Payload parsing ──────────────────────────────────────────────────
// Returns { incoming: [{id, from, type, text}], echoes: [{id, to}] }
export function extractEvents(payload) {
  const incoming = [];
  const echoes = [];
  for (const entry of payload?.entry || []) {
    for (const change of entry?.changes || []) {
      const value = change?.value || {};
      for (const m of value.messages || []) {
        incoming.push({
          id: m.id,
          from: m.from,
          type: m.type,
          text: m.type === 'text' ? (m.text?.body || '') : ''
        });
      }
      // WhatsApp Business app coexistence: messages Stephan sends from the phone app.
      for (const e of value.message_echoes || []) {
        echoes.push({ id: e.id, to: e.to });
      }
    }
  }
  return { incoming, echoes };
}

// WhatsApp formatting: single asterisks for bold, no headings.
export function toWhatsAppText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 1500);
}

// ── Cloud API calls ──────────────────────────────────────────────────
export async function sendWhatsAppText(env, to, body) {
  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`WhatsApp send failed (${res.status}): ${JSON.stringify(data?.error || data)}`);
  return data?.messages?.[0]?.id || null;
}

export async function sendAlertEmail(env, subject, text) {
  if (!env.RESEND_API_KEY) return;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.ALERT_FROM || 'Digital Twin <onboarding@resend.dev>',
      to: [env.ALERT_EMAIL || 'stephantaljaard24@gmail.com'],
      subject,
      text
    })
  });
  if (!res.ok) console.error('Alert email failed:', res.status, await res.text().catch(() => ''));
}

// ── KV helpers (tolerate a missing binding so nothing crashes) ───────
export async function kvGet(env, key) {
  if (!env.CHAT_KV) return null;
  return env.CHAT_KV.get(key);
}
export async function kvPut(env, key, value, ttl) {
  if (!env.CHAT_KV) return;
  await env.CHAT_KV.put(key, value, { expirationTtl: ttl });
}

export async function loadHistory(env, waId) {
  try { return JSON.parse((await kvGet(env, `wa:hist:${waId}`)) || '[]'); } catch { return []; }
}
export async function saveHistory(env, waId, history) {
  await kvPut(env, `wa:hist:${waId}`, JSON.stringify(history.slice(-HISTORY_TURNS * 2)), HISTORY_TTL);
}
