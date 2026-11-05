import { verifySecret } from '../_lib/telegram.js';
import { processUpdate } from '../_lib/telegram-webhook.js';

// POST — Telegram delivers updates here. Return 200 quickly; work continues in waitUntil.
export async function onRequestPost({ request, env, waitUntil }) {
  if (!verifySecret(request, env.TELEGRAM_WEBHOOK_SECRET)) {
    console.warn('Telegram webhook rejected: missing or wrong secret token (check TELEGRAM_WEBHOOK_SECRET)');
    return new Response('Forbidden', { status: 403 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  // Count only — no names or message text in logs.
  console.log(`Telegram webhook: update ${update?.update_id ?? '?'}`);
  waitUntil(processUpdate(env, update).catch(err => console.error('Telegram update error:', err.message)));
  return new Response('OK', { status: 200 });
}
