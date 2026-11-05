# Telegram bot — setup checklist

Webhook URL: `https://stephantaljaard.com/api/telegram`

The code is deployed with the site. These are the one-time steps you do in Telegram and Cloudflare.
Never paste the bot token into chat or commit it — only Cloudflare secrets and your own terminal.

## 1. Create the bot (Telegram, ~2 minutes)
1. In Telegram, open **@BotFather** and send `/newbot`.
2. Display name: `Stephan Taljaard — Digital Twin`. Username: `StephanTwinBot`
   (must end in `bot`; if taken, choose another — then tell Claude so the website button link can be updated).
3. BotFather replies with the **token**. Keep it private.
4. Optional polish, each sent to BotFather:
   - `/setdescription` — "AI digital twin of Stephan Taljaard. Ask about his consulting services, experience and certifications."
   - `/setabouttext` — "AI-generated answers. For pricing or availability: stephantaljaard24@gmail.com"
   - `/setuserpic` — your photo
   - `/setjoingroups` → Disable (the bot is for private chats only)
   - `/setcommands` → `start - About this bot`

## 2. Cloudflare secrets
website → Settings → Variables and Secrets → add as **Secret**:

| Name | Value |
|------|-------|
| `TELEGRAM_BOT_TOKEN` | the token from step 1 |
| `TELEGRAM_WEBHOOK_SECRET` | a long random string you invent (letters, digits, `_` and `-` only; up to 256 characters) |
| `TELEGRAM_OWNER_CHAT_ID` | added in step 4 below |

`OPENROUTER_API_KEY`, `MODEL` and the `CHAT_KV` binding already exist.

## 3. Register the webhook
Run in **your own terminal**, with your real values in place of the placeholders. Replace both
`YOUR_TOKEN` and `YOUR_SECRET` (the same string as `TELEGRAM_WEBHOOK_SECRET`):

```bash
curl -s "https://api.telegram.org/botYOUR_TOKEN/setWebhook" \
  -d "url=https://stephantaljaard.com/api/telegram" \
  -d "secret_token=YOUR_SECRET" \
  -d 'allowed_updates=["message"]'
```

Expected reply: `{"ok":true,"result":true,"description":"Webhook was set"}`.
Check later with `https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo` (look for `last_error_message`).

A bot has only **one** webhook, so never reuse a bot that another tool (such as n8n) is using.

## 4. Find your chat id (for alerts)
1. Open your new bot in Telegram, press **Start**, and send `/myid`.
2. The bot replies with your chat id — a number. Add it as the Cloudflare secret `TELEGRAM_OWNER_CHAT_ID`.
3. Redeploy happens automatically when you save the secret.

## 5. Test
1. Ask: "What certifications do you have?" → the bot answers.
2. Ask: "What are your rates?" → the bot answers, and **you get an alert in your own chat** with the visitor's
   name, username link and message (one alert per person every 6 hours).
3. Send a photo → polite "text only" reply.
4. Send `/start` → greeting that says it's an AI.
5. If it stays silent, check Cloudflare → website → Observability for `POST /api/telegram`:
   a 403 means the secret in step 3 doesn't match `TELEGRAM_WEBHOOK_SECRET`.

## Notes
- The bot answers private chats only; groups, channels and edited messages are ignored.
- Conversation memory is the last ~10 exchanges per person, kept 24 hours in KV, then deleted.
- To stop the bot: send `/revoke` to BotFather for a new token, or delete the webhook with `deleteWebhook`.
