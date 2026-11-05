// Worker entry point. Static files in ./public are served by Cloudflare directly;
// only /api/* requests reach this code (see "run_worker_first" in wrangler.jsonc).
import * as chat from './api/chat.js';
import * as whatsapp from './api/whatsapp.js';
import * as telegram from './api/telegram.js';

const ROUTES = {
  '/api/chat': { OPTIONS: chat.onRequestOptions, POST: chat.onRequestPost },
  '/api/whatsapp': { GET: whatsapp.onRequestGet, POST: whatsapp.onRequestPost },
  '/api/telegram': { POST: telegram.onRequestPost }
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    const route = ROUTES[pathname.replace(/\/+$/, '')];
    const handler = route && route[request.method];

    if (!handler) {
      const status = route ? 405 : 404;
      return new Response(JSON.stringify({ error: route ? 'Method not allowed' : 'Not found' }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return handler({ request, env, waitUntil: p => ctx.waitUntil(p) });
  }
};
