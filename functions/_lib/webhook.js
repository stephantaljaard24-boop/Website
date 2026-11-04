import { answer } from './answer.js';
import {
  extractEvents, toWhatsAppText, sendWhatsAppText, sendAlertEmail, isLead,
  kvGet, kvPut, loadHistory, saveHistory,
  NON_TEXT_REPLY, FALLBACK_REPLY, SEEN_TTL, PAUSE_TTL, ALERT_COOLDOWN
} from './whatsapp.js';
import { rateLimit } from './ratelimit.js';

// Max messages per customer per hour — protects the free model quota.
const CUSTOMER_LIMIT_PER_HOUR = 30;

async function alertOnce(env, waId, subject, text) {
  if (await kvGet(env, `wa:alerted:${waId}`)) return;
  await kvPut(env, `wa:alerted:${waId}`, '1', ALERT_COOLDOWN);
  await sendAlertEmail(env, subject, text);
}

async function handleIncoming(env, msg) {
  // Meta retries webhooks: never process the same message twice.
  if (await kvGet(env, `wa:seen:${msg.id}`)) return;
  await kvPut(env, `wa:seen:${msg.id}`, '1', SEEN_TTL);

  // Stephan replied from the phone app recently — stay quiet so we don't talk over him.
  if (await kvGet(env, `wa:pause:${msg.from}`)) return;

  if (msg.type !== 'text') {
    await sendWhatsAppText(env, msg.from, NON_TEXT_REPLY);
    return;
  }
  if (!msg.text.trim()) return;

  if (!(await rateLimit(env, `wa:${msg.from}`, CUSTOMER_LIMIT_PER_HOUR, 3600))) return;

  const history = await loadHistory(env, msg.from);
  history.push({ role: 'user', content: msg.text });

  let reply;
  try {
    reply = toWhatsAppText(await answer({ messages: history, channel: 'whatsapp', env }));
  } catch (err) {
    console.error('WhatsApp answer failed:', err.message);
    const sentId = await sendWhatsAppText(env, msg.from, FALLBACK_REPLY);
    if (sentId) await kvPut(env, `wa:sent:${sentId}`, '1', SEEN_TTL);
    await alertOnce(env, msg.from, `WhatsApp: bot failed for +${msg.from}`,
      `The Digital Twin could not answer a WhatsApp message and sent the fallback reply.\n\nFrom: +${msg.from}\nMessage: ${msg.text}\nError: ${err.message}\n\nPlease reply personally.`);
    return;
  }

  const sentId = await sendWhatsAppText(env, msg.from, reply);
  if (sentId) await kvPut(env, `wa:sent:${sentId}`, '1', SEEN_TTL);

  history.push({ role: 'assistant', content: reply });
  await saveHistory(env, msg.from, history);

  if (isLead(msg.text)) {
    await alertOnce(env, msg.from, `WhatsApp lead: +${msg.from}`,
      `Someone may be interested in working with you.\n\nFrom: +${msg.from}\nMessage: ${msg.text}\nBot reply: ${reply}\n\nReply from your WhatsApp Business app — the bot pauses for 12 hours once you do.`);
  }
}

async function handleEcho(env, echo) {
  // Echoes of our own bot replies are not manual replies.
  if (echo.id && (await kvGet(env, `wa:sent:${echo.id}`))) return;
  if (echo.to) await kvPut(env, `wa:pause:${echo.to}`, '1', PAUSE_TTL);
}

export async function processPayload(env, payload) {
  const { incoming, echoes } = extractEvents(payload);
  for (const e of echoes) {
    try { await handleEcho(env, e); } catch (err) { console.error('echo error:', err.message); }
  }
  for (const m of incoming) {
    try { await handleIncoming(env, m); } catch (err) { console.error('message error:', err.message); }
  }
}
