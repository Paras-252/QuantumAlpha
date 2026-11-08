// Production Server with Static IP WebSocket Relay for Zerodha Kite Connect
// Run this on your GoDaddy cPanel Node.js App or VPS.
// Because this runs on GoDaddy, all requests to Zerodha originate from GoDaddy's permanent Static IP!

import express from 'express';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import WebSocket, { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// 1. Serve frontend static assets from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// 2. Health & Static IP diagnostic endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Tredye Terminal & GoDaddy Relay Active'
  });
});

// 2b. Generate Daily Access Token from request_token + api_key + api_secret
app.post('/api/kite/session', async (req, res) => {
  try {
    const apiKey = req.body.apiKey || process.env.VITE_KITE_API_KEY;
    const apiSecret = req.body.apiSecret || process.env.KITE_API_SECRET || process.env.VITE_KITE_API_SECRET;
    let requestToken = req.body.requestToken;

    if (!requestToken) {
      return res.status(400).json({ status: 'error', message: 'request_token is required' });
    }

    if (requestToken.includes('request_token=')) {
      try {
        const u = new URL(requestToken, 'http://localhost');
        requestToken = u.searchParams.get('request_token') || requestToken;
      } catch (e) {
        const match = requestToken.match(/request_token=([a-zA-Z0-9]+)/);
        if (match) requestToken = match[1];
      }
    }

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        status: 'error',
        message: 'Kite API Key and API Secret are required to generate access_token'
      });
    }

    // Checksum: SHA256(api_key + request_token + api_secret)
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
    if (data.status === 'success' && data.data?.access_token) {
      return res.json({
        status: 'success',
        accessToken: data.data.access_token,
        userName: data.data.user_name,
        userId: data.data.user_id,
        email: data.data.email
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: data.message || 'Failed to exchange request_token with Zerodha'
      });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. WebSocket Relay for Zerodha KiteTicker
// When your laptop or mobile browser connects to /ws/kite, this GoDaddy server connects
// to Zerodha's wss://ws.kite.trade. Zerodha sees GoDaddy's whitelisted Static IP!
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (clientWs, req) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const apiKey = urlObj.searchParams.get('api_key');
  const accessToken = urlObj.searchParams.get('access_token');

  if (!apiKey || !accessToken) {
    clientWs.send(JSON.stringify({ type: 'error', message: 'api_key and access_token required' }));
    clientWs.close(1008, 'Missing credentials');
    return;
  }

  const targetUrl = `wss://ws.kite.trade?api_key=${encodeURIComponent(apiKey)}&access_token=${encodeURIComponent(accessToken)}`;
  console.log(`[GoDaddy Relay] Connecting to Zerodha from static IP for app: ${apiKey.slice(0, 4)}***`);

  let kiteWs = null;
  try {
    kiteWs = new WebSocket(targetUrl, {
      headers: {
        'User-Agent': 'Tredye-GoDaddy-Relay/1.0'
      }
    });

    // Forward binary packets and text from Zerodha to client browser
    kiteWs.on('message', (data, isBinary) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data, { binary: isBinary });
      }
    });

    // Forward subscription commands from client browser to Zerodha
    clientWs.on('message', (data) => {
      if (kiteWs && kiteWs.readyState === WebSocket.OPEN) {
        kiteWs.send(data);
      }
    });

    kiteWs.on('open', () => {
      console.log('[GoDaddy Relay] Successfully connected to Zerodha KiteTicker WebSocket!');
    });

    kiteWs.on('error', (err) => {
      console.error('[GoDaddy Relay] Zerodha WebSocket error:', err.message);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'error', message: `Zerodha error: ${err.message}` }));
      }
    });

    kiteWs.on('close', (code, reason) => {
      console.log(`[GoDaddy Relay] Zerodha WebSocket closed (${code}): ${reason}`);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(code, reason);
      }
    });

    clientWs.on('close', () => {
      if (kiteWs) {
        try { kiteWs.close(); } catch (e) {}
      }
    });
  } catch (err) {
    console.error('[GoDaddy Relay] Connection creation error:', err);
    clientWs.close(1011, 'Internal Relay Error');
  }
});

// Handle HTTP Upgrade to WebSocket
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  if (pathname === '/ws/kite') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// 4. Catch-all: Route all other requests to index.html for SPA client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Listen on process.env.PORT (defaults to 3000)
server.listen(process.env.PORT || 3000, () => {
  console.log(`Tredye Pro Terminal running on port ${process.env.PORT || 3000}`);
  console.log(`GoDaddy Static IP Relay available at /ws/kite`);
});
