import { answer } from './answer.js';
import { kvGet, kvPut, isLead, SEEN_TTL, ALERT_COOLDOWN } from './whatsapp.js';
import { rateLimit } from './ratelimit.js';
import {
  parseUpdate, toTelegramText, sendTelegramText, sendTyping, alertOwner,
  loadHistory, saveHistory, START_REPLY, NON_TEXT_REPLY, FALLBACK_REPLY
} from './telegram.js';

// Max messages per person per hour — protects the model quota.
const PER_CHAT_LIMIT_PER_HOUR = 30;

function who(msg) {
  return msg.username ? `${msg.name} (@${msg.username})` : msg.name;
}

async function alertOnce(env, msg, text) {
  if (await kvGet(env, `tg:alerted:${msg.chatId}`)) return;
  await kvPut(env, `tg:alerted:${msg.chatId}`, '1', ALERT_COOLDOWN);
  const contact = msg.username
    ? `Reply to them on Telegram: https://t.me/${msg.username}`
    : `No public username. Telegram user id: ${msg.chatId}`;
  await alertOwner(env, `${text}\n\nFrom: ${who(msg)}\n${contact}`);
}

export async function processUpdate(env, update) {
  const msg = parseUpdate(update);
  if (!msg) return;

  // Telegram retries on timeouts: never process the same update twice.
  if (await kvGet(env, `tg:seen:${msg.updateId}`)) return;
  await kvPut(env, `tg:seen:${msg.updateId}`, '1', SEEN_TTL);

  if (msg.command === 'start') {
    await sendTelegramText(env, msg.chatId, START_REPLY);
    return;
  }
  if (msg.command === 'myid') {
    // Lets Stephan find his chat id for TELEGRAM_OWNER_CHAT_ID without a third-party bot.
    await sendTelegramText(env, msg.chatId, `Your Telegram chat id is ${msg.chatId}`);
    return;
  }
  if (msg.command) return; // ignore other slash commands

  if (!msg.isText) {
    await sendTelegramText(env, msg.chatId, NON_TEXT_REPLY);
    return;
  }
  if (!msg.text.trim()) return;

  if (!(await rateLimit(env, `tg:${msg.chatId}`, PER_CHAT_LIMIT_PER_HOUR, 3600))) return;

  await sendTyping(env, msg.chatId);

  const history = await loadHistory(env, msg.chatId);
  history.push({ role: 'user', content: msg.text });

  let reply;
  try {
    reply = toTelegramText(await answer({ messages: history, channel: 'telegram', env }));
  } catch (err) {
    console.error('Telegram answer failed:', err.message);
    await sendTelegramText(env, msg.chatId, FALLBACK_REPLY);
    await alertOnce(env, msg,
      `⚠️ Digital Twin could not answer a Telegram message and sent the fallback reply.\n\nMessage: ${msg.text}\nError: ${err.message}`);
    return;
  }

  await sendTelegramText(env, msg.chatId, reply);

  history.push({ role: 'assistant', content: reply });
  await saveHistory(env, msg.chatId, history);

  if (isLead(msg.text)) {
    await alertOnce(env, msg,
      `💼 Possible enquiry on Telegram.\n\nMessage: ${msg.text}\nBot reply: ${reply}`);
  }
}
