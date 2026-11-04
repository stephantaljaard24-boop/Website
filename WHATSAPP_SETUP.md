# WhatsApp + Digital Twin — setup checklist

Webhook URL: `https://stephantaljaard.com/api/whatsapp`

The code is already in the repo. `website` is a Cloudflare **Workers** project (`wrangler.jsonc`, static site in `public/`, API in `src/`). These are the one-time steps you do in Cloudflare, Resend and Meta.
Meta's UI changes often — if a menu name differs, follow Meta's current docs.

## 1. Cloudflare: KV namespace
1. Cloudflare dashboard → **Storage & Databases → KV → Create** a namespace named `digital-twin-chat`.
2. Copy the namespace **ID** (shown on the KV page). It goes into `wrangler.jsonc` as the `CHAT_KV` binding —
   send it to Claude, or edit the file yourself (see the TODO in it). Do not add the binding in the dashboard:
   the repo's `wrangler.jsonc` is the source of truth and dashboard bindings are replaced on deploy.

## 2. Resend (lead alerts by email)
1. Sign up free at resend.com → **API Keys → Create** (sending access).
2. Free tier can send from `onboarding@resend.dev` to your own sign-up email. Sign up with
   `stephantaljaard24@gmail.com` so alerts reach you.

## 3. Cloudflare: variables and secrets
**website → Settings → Variables and Secrets** (add as **Secret** unless noted), for Production:

| Name | Value |
|------|-------|
| `OPENROUTER_API_KEY` | your OpenRouter key (check it is already set) |
| `WHATSAPP_VERIFY_TOKEN` | any long random string you invent (used in step 5) |
| `WHATSAPP_APP_SECRET` | Meta app → **App settings → Basic → App secret** |
| `WHATSAPP_TOKEN` | permanent System User access token (step 4) |
| `WHATSAPP_PHONE_ID` | WhatsApp → API Setup → **Phone number ID** (not the phone number itself) |
| `RESEND_API_KEY` | from step 2 |
| `ALERT_EMAIL` (plain text, optional) | defaults to stephantaljaard24@gmail.com |
| `MODEL` (plain text, optional) | leave unset for the free model; set `openai/gpt-oss-120b` to switch to paid |

Redeploy after adding secrets (Deployments → Retry deployment, or push a commit).

## 4. Meta: permanent token
1. business.facebook.com → **Business settings → Users → System users → Add** (Admin).
2. **Add assets** → your WhatsApp app (full control) and WhatsApp account.
3. **Generate token** with `whatsapp_business_messaging` and `whatsapp_business_management`, never expires.
   Copy it into `WHATSAPP_TOKEN`. (The temporary token on the API Setup page expires in 24h — don't use it.)

## 5. Meta: webhook
1. developers.facebook.com → your app → **WhatsApp → Configuration → Webhook**.
2. Callback URL: `https://stephantaljaard.com/api/whatsapp`; Verify token: your `WHATSAPP_VERIFY_TOKEN` → **Verify and save**.
3. Subscribe to webhook fields: **messages** and **smb_message_echoes**
   (the echoes field is what lets the bot pause when you reply from your phone).

## 6. Meta: connect your existing Business-app number (coexistence)
Your number is on the WhatsApp Business app, so use Meta's **coexistence** onboarding rather than registering the
number fresh (which would kick it off the app). In the app flow you choose to connect an existing Business app
number and scan a QR code from the app. Keep the app updated and used regularly. Check Meta's current
"WhatsApp Business app coexistence" docs for requirements and limits before starting.

## 7. Website button
The button in `index.html` already uses `27760451158` (international format, digits only).

## 8. Test
1. Message your number from another phone: *"What certifications do you have?"* → bot replies.
2. Ask *"What are your rates?"* → bot replies and you get an email alert.
3. Reply yourself from the Business app → bot stays quiet for that customer for 12 hours.
4. Send a voice note → polite "text only" reply.
5. Check logs: Cloudflare → website → **Logs** (or Observability) if anything is silent.

## 9. Afterwards
- Once `/api/chat` is confirmed working on the live site, delete the `digital-twin` Worker and remove the
  fallback block in the widget in `index.html`.
- Add a line to your privacy notice: chats may be answered by an AI assistant and WhatsApp conversation history is
  kept for 24 hours to give context.

## Running the tests
```bash
node --experimental-default-type=module --test tests/whatsapp.test.mjs
```
