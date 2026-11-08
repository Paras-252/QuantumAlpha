// Production Server with Static IP WebSocket Relay for Zerodha Kite Connect
// Run this on your GoDaddy cPanel Node.js App or VPS.
// Because this runs on GoDaddy, all requests to Zerodha originate from GoDaddy's permanent Static IP!

const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

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

// 3. WebSocket Relay for Zerodha KiteTicker
// When your laptop or mobile browser connects to /ws/kite, this GoDaddy server connects
// to Zerodha's wss://ws.kite.trade. Zerodha sees GoDaddy's whitelisted Static IP!
const wss = new WebSocket.Server({ noServer: true });

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

server.listen(PORT, () => {
  console.log(`Tredye Pro Terminal running on port ${PORT}`);
  console.log(`GoDaddy Static IP Relay available at /ws/kite`);
});

