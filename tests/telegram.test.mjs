// Run with:  node --experimental-default-type=module --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';

import worker from '../src/worker.js';
import { onRequestPost } from '../src/api/telegram.js';
import { processUpdate } from '../src/_lib/telegram-webhook.js';
import { parseUpdate, verifySecret, toTelegramText } from '../src/_lib/telegram.js';
import { buildSystemPrompt } from '../src/_lib/prompt.js';

class FakeKV {
  constructor() { this.m = new Map(); }
  async get(k) { return this.m.has(k) ? this.m.get(k) : null; }
  async put(k, v) { this.m.set(k, v); }
}

const makeEnv = (extra = {}) => ({
  CHAT_KV: new FakeKV(),
  OPENROUTER_API_KEY: 'or-key',
  TELEGRAM_BOT_TOKEN: 'tg-token',
  TELEGRAM_WEBHOOK_SECRET: 'whsecret',
  TELEGRAM_OWNER_CHAT_ID: '999',
  ...extra
});

function mockFetch({ llmReply = 'Hello from Stephan', llmFail = false } = {}) {
  const calls = { llm: [], sent: [], actions: [] };
  globalThis.fetch = async (url, opts) => {
    const body = JSON.parse(opts.body);
    if (url.includes('openrouter.ai')) {
      calls.llm.push(body);
      if (llmFail) return new Response(JSON.stringify({ error: { message: 'rate limited' } }), { status: 429 });
      return new Response(JSON.stringify({ choices: [{ message: { content: llmReply } }] }), { status: 200 });
    }
    if (url.includes('api.telegram.org') && url.endsWith('/sendMessage')) {
      assert.ok(url.includes('/bottg-token/'));
      calls.sent.push(body);
      return new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 });
    }
    if (url.includes('api.telegram.org') && url.endsWith('/sendChatAction')) {
      calls.actions.push(body);
      return new Response(JSON.stringify({ ok: true, result: true }), { status: 200 });
    }
    throw new Error('unexpected fetch ' + url);
  };
  return calls;
}

const msg = (updateId, text, extra = {}) => ({
  update_id: updateId,
  message: {
    chat: { id: 111, type: 'private' },
    from: { id: 111, first_name: 'Ana', last_name: 'Lee', username: 'ana_lee', is_bot: false },
    text,
    ...extra
  }
});

test('secret header is verified in constant-time style', () => {
  const req = s => new Request('https://x', { method: 'POST', headers: s ? { 'X-Telegram-Bot-Api-Secret-Token': s } : {} });
  assert.equal(verifySecret(req('whsecret'), 'whsecret'), true);
  assert.equal(verifySecret(req('wrong!!!!'), 'whsecret'), false);
  assert.equal(verifySecret(req('short'), 'whsecret'), false);
  assert.equal(verifySecret(req(null), 'whsecret'), false);
  assert.equal(verifySecret(req('whsecret'), undefined), false);
});

test('POST rejects missing secret, accepts valid one', async () => {
  const env = makeEnv();
  const calls = mockFetch();
  const pending = [];
  const waitUntil = p => pending.push(p);
  const mk = h => new Request('https://x/api/telegram', { method: 'POST', body: JSON.stringify(msg(1, 'hi')), headers: h });

  const bad = await onRequestPost({ request: mk({}), env, waitUntil });
  assert.equal(bad.status, 403);
  assert.equal(pending.length, 0);

  const good = await onRequestPost({ request: mk({ 'X-Telegram-Bot-Api-Secret-Token': 'whsecret' }), env, waitUntil });
  assert.equal(good.status, 200);
  await Promise.all(pending);
  assert.equal(calls.sent.length, 1);
});

test('worker routes /api/telegram (POST only) and rejects unknown paths', async () => {
  const env = makeEnv();
  mockFetch();
  const ctx = { waitUntil() {} };
  const noSecret = await worker.fetch(new Request('https://x/api/telegram', { method: 'POST', body: '{}' }), env, ctx);
  assert.equal(noSecret.status, 403);
  const get = await worker.fetch(new Request('https://x/api/telegram'), env, ctx);
  assert.equal(get.status, 405);
  const nope = await worker.fetch(new Request('https://x/api/nope'), env, ctx);
  assert.equal(nope.status, 404);
});

test('replies once, uses Telegram prompt, keeps history, dedupes retries', async () => {
  const env = makeEnv();
  const calls = mockFetch({ llmReply: '**Hi** there' });

  await processUpdate(env, msg(10, 'What do you do?'));
  await processUpdate(env, msg(10, 'What do you do?')); // Telegram retry

  assert.equal(calls.sent.length, 1, 'duplicate update must not double-reply');
  assert.equal(calls.sent[0].chat_id, 111);
  assert.equal(calls.sent[0].text, 'Hi there');
  assert.equal(calls.actions.length, 1);
  assert.match(calls.llm[0].messages[0].content, /Telegram/);
  assert.doesNotMatch(calls.llm[0].messages[0].content, /hiking/);

  await processUpdate(env, msg(11, 'And certifications?'));
  const roles = calls.llm[1].messages.filter(m => m.role !== 'system').map(m => m.role);
  assert.deepEqual(roles, ['user', 'assistant', 'user']);
});

test('/start greets and discloses AI; /myid returns chat id; other commands ignored', async () => {
  const env = makeEnv();
  const calls = mockFetch();
  await processUpdate(env, msg(20, '/start'));
  assert.match(calls.sent[0].text, /AI digital twin/);
  await processUpdate(env, msg(21, '/myid'));
  assert.match(calls.sent[1].text, /111/);
  await processUpdate(env, msg(22, '/unknown'));
  assert.equal(calls.sent.length, 2);
  assert.equal(calls.llm.length, 0);
});

test('lead message alerts the owner chat once, with a contact link', async () => {
  const env = makeEnv();
  const calls = mockFetch();
  await processUpdate(env, msg(30, 'What is your pricing?'));
  await processUpdate(env, msg(31, 'Can we book a call?'));
  const alerts = calls.sent.filter(s => String(s.chat_id) === '999');
  assert.equal(alerts.length, 1);
  assert.match(alerts[0].text, /https:\/\/t\.me\/ana_lee/);
  assert.match(alerts[0].text, /pricing/);
});

test('no alert (and no crash) when owner chat is not configured', async () => {
  const env = makeEnv({ TELEGRAM_OWNER_CHAT_ID: undefined });
  const calls = mockFetch();
  await processUpdate(env, msg(40, 'What is your pricing?'));
  assert.equal(calls.sent.length, 1);
});

test('non-text messages get a canned reply without calling the model', async () => {
  const env = makeEnv();
  const calls = mockFetch();
  const photo = { update_id: 50, message: { chat: { id: 111, type: 'private' }, from: { id: 111, first_name: 'Ana', is_bot: false }, photo: [{}] } };
  await processUpdate(env, photo);
  assert.equal(calls.llm.length, 0);
  assert.match(calls.sent[0].text, /text messages/);
});

test('groups, channel posts, edits and bots are ignored', async () => {
  const env = makeEnv();
  const calls = mockFetch();
  await processUpdate(env, { update_id: 60, message: { chat: { id: -5, type: 'group' }, from: { id: 1, first_name: 'X', is_bot: false }, text: 'hello' } });
  await processUpdate(env, { update_id: 61, edited_message: { chat: { id: 111, type: 'private' }, text: 'edited' } });
  await processUpdate(env, { update_id: 62, channel_post: { chat: { id: 7, type: 'channel' }, text: 'post' } });
  await processUpdate(env, { update_id: 63, message: { chat: { id: 8, type: 'private' }, from: { id: 8, first_name: 'Bot', is_bot: true }, text: 'beep' } });
  assert.equal(calls.sent.length, 0);
  assert.equal(calls.llm.length, 0);
});

test('model failure sends fallback to the user and alerts the owner', async () => {
  const env = makeEnv();
  const calls = mockFetch({ llmFail: true });
  await processUpdate(env, msg(70, 'hello'));
  assert.match(calls.sent[0].text, /technical hiccup/);
  const alerts = calls.sent.filter(s => String(s.chat_id) === '999');
  assert.equal(alerts.length, 1);
});

test('parseUpdate normalises commands with bot suffix and payload', () => {
  assert.equal(parseUpdate(msg(1, '/start@StephanTwinBot')).command, 'start');
  assert.equal(parseUpdate(msg(1, '/start abc')).command, 'start');
  assert.equal(parseUpdate(msg(1, 'hello')).command, null);
  assert.equal(parseUpdate(msg(1, 'hi')).username, 'ana_lee');
});

test('prompt rules: Telegram is business-only with shared safety rules', () => {
  const p = buildSystemPrompt('telegram');
  assert.match(p, /Behaviour Rules \(Telegram\)/);
  assert.match(p, /Never promise anything on Stephan's behalf/);
  assert.doesNotMatch(p, /hiking|Married/);
  assert.match(buildSystemPrompt('whatsapp'), /Behaviour Rules \(WhatsApp\)/);
});

test('toTelegramText strips markdown', () => {
  assert.equal(toTelegramText('## Title\n**bold**'), 'Title\nbold');
});
