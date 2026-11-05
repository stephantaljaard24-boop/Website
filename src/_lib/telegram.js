// Helpers for the Telegram Bot API webhook.
import { kvGet, kvPut, HISTORY_TURNS, HISTORY_TTL } from './whatsapp.js';

export const START_REPLY = "Hi! I'm Stephan Taljaard's AI digital twin. Ask me about his consulting services, experience and certifications. For pricing or availability, please email stephantaljaard24@gmail.com or message him on LinkedIn (linkedin.com/in/stephantaljaard).";
export const NON_TEXT_REPLY = "Thanks for your message! I can only read text messages — could you type your question? You can also email stephantaljaard24@gmail.com.";
export const FALLBACK_REPLY = "Thanks for your message — I'm having a technical hiccup right now. Please email stephantaljaard24@gmail.com or message Stephan on LinkedIn (linkedin.com/in/stephantaljaard).";

// Constant-time comparison of the secret Telegram echoes back in a header.
export function verifySecret(request, expected) {
  const given = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
  if (!expected || !given || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

// Returns a normalised private-chat message, or null for anything we ignore
// (edited messages, channel posts, group chats, bots, callbacks...).
export function parseUpdate(update) {
  const m = update?.message;
  if (!m || !m.chat || m.chat.type !== 'private' || m.from?.is_bot) return null;

  const text = typeof m.text === 'string' ? m.text : '';
  // "/start", "/start payload", "/myid@BotName" -> "start" / "myid"
  const command = text.startsWith('/') ? text.slice(1).split(/[\s@]/)[0].toLowerCase() : null;

  return {
    updateId: update.update_id,
    chatId: m.chat.id,
    name: [m.from?.first_name, m.from?.last_name].filter(Boolean).join(' ') || 'Unknown',
    username: m.from?.username || null,
    isText: typeof m.text === 'string',
    text,
    command
  };
}

// Plain text only (no parse_mode), so no escaping problems.
export function toTelegramText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 1500);
}

async function api(env, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(`Telegram ${method} failed (${res.status}): ${data.description || 'unknown error'}`);
  }
  return data.result;
}

export function sendTelegramText(env, chatId, text) {
  return api(env, 'sendMessage', { chat_id: chatId, text, disable_web_page_preview: true });
}

export async function sendTyping(env, chatId) {
  try { await api(env, 'sendChatAction', { chat_id: chatId, action: 'typing' }); } catch { /* cosmetic */ }
}

// Alerts go to Stephan's own Telegram chat. Silently skipped if not configured.
export async function alertOwner(env, text) {
  if (!env.TELEGRAM_OWNER_CHAT_ID) return;
  try {
    await sendTelegramText(env, env.TELEGRAM_OWNER_CHAT_ID, text.slice(0, 3500));
  } catch (err) {
    console.error('Telegram owner alert failed:', err.message);
  }
}

export async function loadHistory(env, chatId) {
  try { return JSON.parse((await kvGet(env, `tg:hist:${chatId}`)) || '[]'); } catch { return []; }
}
export async function saveHistory(env, chatId, history) {
  await kvPut(env, `tg:hist:${chatId}`, JSON.stringify(history.slice(-HISTORY_TURNS * 2)), HISTORY_TTL);
}
