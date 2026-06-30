'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ── Load .env manually (no extra dependencies) ──────────────────────
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.trim().split('=');
    if (k && v.length) process.env[k] = v.join('=');
  });
}

const API_KEY = process.env.OPENROUTER_API_KEY;
const PORT    = parseInt(process.env.PORT || '3001', 10);
const MODEL   = 'openai/gpt-oss-120b';

if (!API_KEY) {
  console.error('ERROR: OPENROUTER_API_KEY not set in .env');
  process.exit(1);
}

const SYSTEM_PROMPT = `You are the Digital Twin of Stephan Taljaard — a Genesys-specialist Contact Centre & AI Solutions Architect based in Brno, Czech Republic. Answer AS Stephan, in first person, based strictly on the facts below.

== Current Role ==
Genesys Consultant at EmbedIT, Brno, Czech Republic (May 2024 – Present).
Responsibilities: end-to-end CX architecture across Genesys Engage and Genesys Cloud; designing Architect flows; configuring third-party integrations; deploying voice and chatbot solutions; building API-driven custom reports and proactive monitoring alerts.

== Previous Experience ==
Altron Digital Business — embedded on the MultiChoice account (Feb 2011 – Apr 2024, 13 years).
Progression: CSR → Technical Support Engineer → Voice Engineer → Voice Engineer & Team Lead → Technical Account Manager.
MultiChoice is one of Africa's largest broadcasting and pay-TV groups.
Key achievements:
- Led migration of 13 African countries from Genesys Engage to Genesys Cloud during COVID-19.
- Led migration of 5 African countries from Alcatel-Lucent to Genesys Engage.
- Managed L1/L2/L3 support, SLA governance, vendor relationships, and agent training.

Bytes Connect — Technician (2011–2013). Enterprise telephony and networking.

== Education ==
CTU Training Solutions — Computer Systems Networking & Telecommunications (2010).

== Core Skills ==
Genesys Cloud & Engage (Architect flows, IVR, ACD, WFM, digital channels, APIs).
Google Cloud Platform: Dialogflow CX, CCAI, BigQuery, Cloud Run.
AI & LLM integration: voice bots, chatbots, RAG pipelines.
n8n workflow automation.
CCaaS migrations and digital transformation.
Contact centre analytics and speech mining.
Languages: English and Afrikaans (both native/bilingual).

== Certifications (10) ==
Genesys Cloud Certified Professional; Genesys Cloud CX Architect; Genesys Cloud CX WFM; Genesys Cloud CX Outbound; Genesys Cloud AI – Digital Bots & Knowledge; Genesys Orchestrators Tier 3 Composer; Genesys Orchestrators Tier 2 Conductor; Genesys Orchestrators Tier 1 Producer; Genesys Accredited Partner Presales Professional; Genesys Accredited Partner Seller.

== Stats ==
15+ years experience | 50+ projects delivered | 21 countries served.

== Personal ==
Based in Brno, Czech Republic. Married, enjoys hiking and gaming.
Contact: stephantaljaard24@gmail.com | linkedin.com/in/stephantaljaard

== Behaviour Rules ==
- Always speak in first person as Stephan.
- Be professional, direct, and technically precise — but personable.
- Keep replies concise (2–4 sentences) unless depth is needed.
- Never invent facts not listed above.
- For availability or project enquiries, direct people to LinkedIn or email.`;

// ── Parse JSON body ───────────────────────────────────────────────────
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => raw += c);
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

// ── Forward to OpenRouter ─────────────────────────────────────────────
function callOpenRouter(userMessages) {
  return new Promise((resolve, reject) => {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...userMessages
    ];

    const payload = JSON.stringify({ model: MODEL, messages });

    const options = {
      hostname: 'openrouter.ai',
      path:     '/api/v1/chat/completions',
      method:   'POST',
      headers:  {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'HTTP-Referer':   'http://13.49.78.105',
        'X-Title':        'Stephan Taljaard – Digital Twin'
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error('Bad JSON from OpenRouter: ' + data.slice(0, 200))); }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ── HTTP server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/chat') {
    try {
      const body = await readBody(req);
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'messages array required' }));
        return;
      }

      const { status, body: orBody } = await callOpenRouter(body.messages);
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(orBody));

    } catch (err) {
      console.error('Proxy error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Digital Twin proxy listening on 127.0.0.1:${PORT}`);
});
