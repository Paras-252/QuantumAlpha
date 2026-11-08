import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import crypto from 'crypto';

function viteKiteSessionPlugin() {
  return {
    name: 'vite-kite-session-plugin',
    configureServer(server) {
      server.middlewares.use('/api/kite/session', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method not allowed' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const env = loadEnv('', process.cwd(), '');
            const apiKey = parsed.apiKey || env.VITE_KITE_API_KEY;
            const apiSecret = parsed.apiSecret || env.KITE_API_SECRET || env.VITE_KITE_API_SECRET;
            let requestToken = parsed.requestToken;

            if (requestToken && requestToken.includes('request_token=')) {
              const match = requestToken.match(/request_token=([a-zA-Z0-9]+)/);
              if (match) requestToken = match[1];
            }

            if (!apiKey || !apiSecret || !requestToken) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                status: 'error',
                message: 'apiKey, apiSecret, and requestToken are required'
              }));
            }

            const hash = crypto.createHash('sha256').update(apiKey + requestToken + apiSecret).digest('hex');
            const form = new URLSearchParams({
              api_key: apiKey,
              request_token: requestToken,
              checksum: hash
            });

            const response = await fetch('https://api.kite.trade/session/token', {
              method: 'POST',
              headers: {
                'X-Kite-Version': '3',
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: form.toString()
            });

            const data = await response.json();
            res.statusCode = response.ok ? 200 : 400;
            res.setHeader('Content-Type', 'application/json');
            if (data.status === 'success' && data.data?.access_token) {
              res.end(JSON.stringify({
                status: 'success',
                accessToken: data.data.access_token,
                userName: data.data.user_name,
                userId: data.data.user_id
              }));
            } else {
              res.end(JSON.stringify({
                status: 'error',
                message: data.message || 'Zerodha token exchange failed'
              }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'error', message: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), viteKiteSessionPlugin()],
  server: {
    port: 3000,
    open: false
  }
});
