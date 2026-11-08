// Zerodha KiteTicker WebSocket Client & Binary Protocol Parser
// Official Kite Connect WebSocket: wss://ws.kite.trade?api_key=...&access_token=...

export const KITE_TOKENS = {
  // Major Indices
  256265: { symbol: 'NIFTY 50', name: 'Nifty 50', type: 'index', base: 25030.35, prevClose: 24964.15 },
  260105: { symbol: 'BANKNIFTY', name: 'Nifty Bank', type: 'index', base: 59086.00, prevClose: 58850.40 },
  257801: { symbol: 'FINNIFTY', name: 'Nifty Financial Services', type: 'index', base: 27283.95, prevClose: 26998.55 },
  288009: { symbol: 'MIDCPNIFTY', name: 'Nifty Midcap Select', type: 'index', base: 14008.80, prevClose: 13980.20 },
  264969: { symbol: 'INDIA VIX', name: 'India VIX', type: 'index', base: 17.66, prevClose: 18.05 },

  // Heavyweight F&O Equities
  738561: { symbol: 'RELIANCE', name: 'Reliance Industries', type: 'stock', base: 2985.40, prevClose: 2972.10 },
  341249: { symbol: 'HDFCBANK', name: 'HDFC Bank', type: 'stock', base: 1682.15, prevClose: 1675.00 },
  1270529: { symbol: 'ICICIBANK', name: 'ICICI Bank', type: 'stock', base: 1245.80, prevClose: 1238.20 },
  779521: { symbol: 'SBIN', name: 'State Bank of India', type: 'stock', base: 824.50, prevClose: 819.30 },
  408065: { symbol: 'INFY', name: 'Infosys', type: 'stock', base: 1892.60, prevClose: 1884.00 },
  2953217: { symbol: 'TCS', name: 'Tata Consultancy Services', type: 'stock', base: 4195.00, prevClose: 4180.00 },
  884737: { symbol: 'TATAMOTORS', name: 'Tata Motors', type: 'stock', base: 986.30, prevClose: 978.50 },
  897665: { symbol: 'TATASTEEL', name: 'Tata Steel', type: 'stock', base: 154.85, prevClose: 153.20 },
  3861249: { symbol: 'ADANIENT', name: 'Adani Enterprises', type: 'stock', base: 3120.00, prevClose: 3105.00 },
  3050241: { symbol: 'BAJFINANCE', name: 'Bajaj Finance', type: 'stock', base: 7350.00, prevClose: 7310.00 },
  633601: { symbol: 'LT', name: 'Larsen & Toubro', type: 'stock', base: 3620.00, prevClose: 3595.00 },
  4953601: { symbol: 'BHARTIARTL', name: 'Bharti Airtel', type: 'stock', base: 1650.00, prevClose: 1642.00 },
  54273: { symbol: 'AXISBANK', name: 'Axis Bank', type: 'stock', base: 1210.00, prevClose: 1202.00 },
  377857: { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', type: 'stock', base: 1785.00, prevClose: 1776.00 }
};

export const DEFAULT_SUBSCRIBE_TOKENS = Object.keys(KITE_TOKENS).map(Number);

/**
 * Binary DataView parser for official Zerodha KiteTicker protocol.
 * Unpacks binary packets (8-byte LTP, 28/32-byte Index, 44-byte Quote, 184-byte Full depth & OI).
 */
export function parseKiteBinary(buffer) {
  if (!(buffer instanceof ArrayBuffer)) return [];
  const view = new DataView(buffer);
  if (view.byteLength < 2) return [];

  const numPackets = view.getUint16(0);
  let offset = 2;
  const ticks = [];

  for (let i = 0; i < numPackets && offset < buffer.byteLength; i++) {
    if (offset + 2 > buffer.byteLength) break;
    const packetLength = view.getUint16(offset);
    offset += 2;

    if (offset + packetLength > buffer.byteLength) break;

    // Check for currency segment token (usually 3 decimal places / 10,000,000 or 100)
    const instrumentToken = view.getUint32(offset);
    const meta = KITE_TOKENS[instrumentToken] || { symbol: `TOKEN_${instrumentToken}`, type: 'unknown' };
    const divisor = 100.0;

    if (packetLength === 8) {
      // LTP Mode
      const lastPrice = view.getInt32(offset + 4) / divisor;
      ticks.push({
        instrument_token: instrumentToken,
        symbol: meta.symbol,
        name: meta.name || meta.symbol,
        type: meta.type,
        mode: 'ltp',
        last_price: +lastPrice.toFixed(2)
      });
    } else if (packetLength === 28 || packetLength === 32) {
      // Index Quote Mode
      const lastPrice = view.getInt32(offset + 4) / divisor;
      const high = view.getInt32(offset + 8) / divisor;
      const low = view.getInt32(offset + 12) / divisor;
      const open = view.getInt32(offset + 16) / divisor;
      const close = view.getInt32(offset + 20) / divisor;
      const change = +(lastPrice - close).toFixed(2);
      const pChange = close ? +((change / close) * 100).toFixed(2) : 0;

      ticks.push({
        instrument_token: instrumentToken,
        symbol: meta.symbol,
        name: meta.name || meta.symbol,
        type: meta.type,
        mode: 'quote',
        last_price: +lastPrice.toFixed(2),
        ohlc: { open, high, low, close },
        change,
        pChange
      });
    } else if (packetLength === 44) {
      // Stock Quote Mode
      const lastPrice = view.getInt32(offset + 4) / divisor;
      const lastQty = view.getInt32(offset + 8);
      const avgPrice = view.getInt32(offset + 12) / divisor;
      const volume = view.getInt32(offset + 16);
      const buyQty = view.getInt32(offset + 20);
      const sellQty = view.getInt32(offset + 24);
      const open = view.getInt32(offset + 28) / divisor;
      const high = view.getInt32(offset + 32) / divisor;
      const low = view.getInt32(offset + 36) / divisor;
      const close = view.getInt32(offset + 40) / divisor;
      const change = +(lastPrice - close).toFixed(2);
      const pChange = close ? +((change / close) * 100).toFixed(2) : 0;

      ticks.push({
        instrument_token: instrumentToken,
        symbol: meta.symbol,
        name: meta.name || meta.symbol,
        type: meta.type,
        mode: 'quote',
        last_price: +lastPrice.toFixed(2),
        last_quantity: lastQty,
        average_price: +avgPrice.toFixed(2),
        volume,
        buy_quantity: buyQty,
        sell_quantity: sellQty,
        ohlc: { open, high, low, close },
        change,
        pChange
      });
    } else if (packetLength === 184) {
      // Full Mode (Quote + OI + 5-Depth Depth)
      const lastPrice = view.getInt32(offset + 4) / divisor;
      const lastQty = view.getInt32(offset + 8);
      const avgPrice = view.getInt32(offset + 12) / divisor;
      const volume = view.getInt32(offset + 16);
      const buyQty = view.getInt32(offset + 20);
      const sellQty = view.getInt32(offset + 24);
      const open = view.getInt32(offset + 28) / divisor;
      const high = view.getInt32(offset + 32) / divisor;
      const low = view.getInt32(offset + 36) / divisor;
      const close = view.getInt32(offset + 40) / divisor;
      const lastTradeTime = view.getUint32(offset + 44);
      const oi = view.getInt32(offset + 48);
      const oiDayHigh = view.getInt32(offset + 52);
      const oiDayLow = view.getInt32(offset + 56);
      const timestamp = view.getUint32(offset + 60);

      // 10 Market depth levels (5 buy, 5 sell)
      const depth = { buy: [], sell: [] };
      let depthOffset = offset + 64;
      for (let d = 0; d < 5; d++) {
        const quantity = view.getUint32(depthOffset);
        const price = view.getInt32(depthOffset + 4) / divisor;
        const orders = view.getUint16(depthOffset + 8);
        depth.buy.push({ quantity, price: +price.toFixed(2), orders });
        depthOffset += 12;
      }
      for (let d = 0; d < 5; d++) {
        const quantity = view.getUint32(depthOffset);
        const price = view.getInt32(depthOffset + 4) / divisor;
        const orders = view.getUint16(depthOffset + 8);
        depth.sell.push({ quantity, price: +price.toFixed(2), orders });
        depthOffset += 12;
      }

      const change = +(lastPrice - close).toFixed(2);
      const pChange = close ? +((change / close) * 100).toFixed(2) : 0;

      ticks.push({
        instrument_token: instrumentToken,
        symbol: meta.symbol,
        name: meta.name || meta.symbol,
        type: meta.type,
        mode: 'full',
        last_price: +lastPrice.toFixed(2),
        last_quantity: lastQty,
        average_price: +avgPrice.toFixed(2),
        volume,
        buy_quantity: buyQty,
        sell_quantity: sellQty,
        ohlc: { open, high, low, close },
        change,
        pChange,
        last_trade_time: lastTradeTime,
        oi,
        oi_day_high: oiDayHigh,
        oi_day_low: oiDayLow,
        timestamp,
        depth
      });
    }

    offset += packetLength;
  }

  return ticks;
}

export class KiteTickerService {
  constructor({
    apiKey = '',
    accessToken = '',
    mode = 'full', // 'full' | 'quote' | 'ltp'
    connectionMode = 'direct', // 'direct' | 'relay'
    relayHost = '',
    tokens = DEFAULT_SUBSCRIBE_TOKENS,
    onStatusChange,
    onTicks,
    onError
  } = {}) {
    this.apiKey = apiKey;
    this.accessToken = accessToken;
    this.mode = mode;
    this.connectionMode = connectionMode;
    this.relayHost = relayHost;
    this.tokens = tokens;
    this.onStatusChange = onStatusChange;
    this.onTicks = onTicks;
    this.onError = onError;

    this.ws = null;
    this.status = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'AUTH_REQUIRED'
    this.reconnectTimer = null;
    this.simTimer = null;
    this.isSimulating = false;
    this.stats = {
      ticksCount: 0,
      packetsCount: 0,
      lastTickTime: null,
      bytesReceived: 0,
      lastTicks: []
    };

    // Internal simulation prices
    this.simPrices = {};
    for (const [t, data] of Object.entries(KITE_TOKENS)) {
      this.simPrices[t] = {
        ltp: data.base,
        change: +(data.base - data.prevClose).toFixed(2),
        volume: 500000 + Math.floor(Math.random() * 500000),
        oi: 1200000 + Math.floor(Math.random() * 800000)
      };
    }
  }

  updateConfig({ apiKey, accessToken, mode, connectionMode, relayHost }) {
    if (apiKey !== undefined) this.apiKey = apiKey;
    if (accessToken !== undefined) this.accessToken = accessToken;
    if (mode !== undefined) this.mode = mode;
    if (connectionMode !== undefined) this.connectionMode = connectionMode;
    if (relayHost !== undefined) this.relayHost = relayHost;
  }

  connect() {
    this.stopSimulation();
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }

    if (!this.apiKey || !this.accessToken) {
      this.setStatus('AUTH_REQUIRED', 'API Key & Access Token are required');
      return;
    }

    let wsUrl = `wss://ws.kite.trade?api_key=${encodeURIComponent(this.apiKey)}&access_token=${encodeURIComponent(this.accessToken)}`;

    // If using GoDaddy Static IP WebSocket Relay
    if (this.connectionMode === 'relay') {
      try {
        const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = this.relayHost || (typeof window !== 'undefined' ? window.location.host : 'localhost:3000');
        wsUrl = `${protocol}//${host}/ws/kite?api_key=${encodeURIComponent(this.apiKey)}&access_token=${encodeURIComponent(this.accessToken)}`;
      } catch (e) {}
    }

    this.setStatus('CONNECTING', `Connecting via ${this.connectionMode === 'relay' ? 'GoDaddy Static IP Relay' : 'Direct Kite WebSocket'}...`);

    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.setStatus('CONNECTED');
        this.subscribe(this.tokens, this.mode);
      };

      this.ws.onmessage = (event) => {
        try {
          if (typeof event.data === 'string') {
            // Heartbeat or JSON message
            try {
              const parsed = JSON.parse(event.data);
              if (parsed.type === 'error' || parsed.status === 'error') {
                if (parsed.message?.includes('token') || parsed.message?.includes('auth')) {
                  this.setStatus('AUTH_REQUIRED', parsed.message);
                }
              }
            } catch (e) {}
            return;
          }

          if (event.data instanceof ArrayBuffer) {
            this.stats.bytesReceived += event.data.byteLength;
            this.stats.packetsCount += 1;
            const ticks = parseKiteBinary(event.data);
            if (ticks && ticks.length > 0) {
              this.stats.ticksCount += ticks.length;
              this.stats.lastTickTime = new Date().toLocaleTimeString('en-IN', { hour12: false }) + '.' + String(Date.now() % 1000).padStart(3, '0');
              this.stats.lastTicks = ticks.slice(0, 5);
              if (this.onTicks) {
                this.onTicks(ticks);
              }
            }
          }
        } catch (err) {
          if (this.onError) this.onError(err);
        }
      };

      this.ws.onerror = (err) => {
        this.setStatus('ERROR', 'WebSocket Connection Error');
        if (this.onError) this.onError(err);
      };

      this.ws.onclose = (event) => {
        // Zerodha closes with code 4003 or 403 on invalid/expired access tokens
        if (event.code === 4003 || event.code === 403 || event.reason?.toLowerCase().includes('token')) {
          this.setStatus('AUTH_REQUIRED', 'Session expired. Daily access token required.');
        } else {
          this.setStatus('DISCONNECTED', `Socket closed (${event.code})`);
        }
      };
    } catch (e) {
      this.setStatus('ERROR', e.message);
    }
  }

  disconnect() {
    this.stopSimulation();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    this.setStatus('DISCONNECTED');
  }

  subscribe(tokens = this.tokens, mode = this.mode) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify({ a: 'subscribe', v: tokens }));
      this.ws.send(JSON.stringify({ a: 'mode', v: [mode, tokens] }));
    } catch (e) {
      console.warn('Kite subscribe error:', e);
    }
  }

  setStatus(newStatus, message = '') {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus, message, this.stats);
    }
  }

  // --- Embedded Simulation Engine ---
  // Lets the user test and verify tick streaming on weekends, off-hours, or before logging in.
  startSimulation() {
    this.disconnect();
    this.isSimulating = true;
    this.setStatus('CONNECTED', 'Streaming simulated Kite binary ticks (500ms latency)');

    this.simTimer = setInterval(() => {
      const selectedTokenKeys = Object.keys(KITE_TOKENS);
      // Pick 3-6 random tokens to tick per cycle
      const count = 3 + Math.floor(Math.random() * 4);
      const shuffled = [...selectedTokenKeys].sort(() => 0.5 - Math.random()).slice(0, count);

      const generatedTicks = shuffled.map(tKey => {
        const token = Number(tKey);
        const meta = KITE_TOKENS[token];
        const cur = this.simPrices[token];
        const step = meta.type === 'index' ? (meta.base * 0.0004) : (meta.base * 0.0008);
        const delta = (Math.random() - 0.49) * step;

        cur.ltp = +(cur.ltp + delta).toFixed(2);
        cur.change = +(cur.ltp - meta.prevClose).toFixed(2);
        cur.volume += Math.floor(Math.random() * 250);
        cur.oi += Math.floor((Math.random() - 0.48) * 120);

        const pChange = +((cur.change / meta.prevClose) * 100).toFixed(2);
        const spread = +(cur.ltp * 0.0002).toFixed(2);

        // Simulated 5-depth orderbook
        const depth = {
          buy: [
            { quantity: 1500, price: +(cur.ltp - spread).toFixed(2), orders: 12 },
            { quantity: 2400, price: +(cur.ltp - spread * 2).toFixed(2), orders: 18 },
            { quantity: 3800, price: +(cur.ltp - spread * 3).toFixed(2), orders: 25 },
            { quantity: 5100, price: +(cur.ltp - spread * 4).toFixed(2), orders: 34 },
            { quantity: 8900, price: +(cur.ltp - spread * 5).toFixed(2), orders: 49 }
          ],
          sell: [
            { quantity: 1400, price: +(cur.ltp + spread).toFixed(2), orders: 10 },
            { quantity: 2200, price: +(cur.ltp + spread * 2).toFixed(2), orders: 16 },
            { quantity: 3600, price: +(cur.ltp + spread * 3).toFixed(2), orders: 22 },
            { quantity: 4800, price: +(cur.ltp + spread * 4).toFixed(2), orders: 31 },
            { quantity: 8200, price: +(cur.ltp + spread * 5).toFixed(2), orders: 45 }
          ]
        };

        return {
          instrument_token: token,
          symbol: meta.symbol,
          name: meta.name,
          type: meta.type,
          mode: 'full',
          last_price: cur.ltp,
          last_quantity: Math.floor(Math.random() * 50) + 1,
          average_price: +(cur.ltp - 0.5).toFixed(2),
          volume: cur.volume,
          buy_quantity: 45000,
          sell_quantity: 42000,
          ohlc: {
            open: meta.prevClose,
            high: +(cur.ltp + meta.base * 0.004).toFixed(2),
            low: +(cur.ltp - meta.base * 0.004).toFixed(2),
            close: meta.prevClose
          },
          change: cur.change,
          pChange,
          oi: cur.oi,
          timestamp: Math.floor(Date.now() / 1000),
          depth
        };
      });

      this.stats.ticksCount += generatedTicks.length;
      this.stats.packetsCount += 1;
      this.stats.bytesReceived += generatedTicks.length * 184;
      this.stats.lastTickTime = new Date().toLocaleTimeString('en-IN', { hour12: false }) + '.' + String(Date.now() % 1000).padStart(3, '0');
      this.stats.lastTicks = generatedTicks;

      if (this.onTicks) {
        this.onTicks(generatedTicks);
      }
    }, 500);
  }

  stopSimulation() {
    this.isSimulating = false;
    if (this.simTimer) {
      clearInterval(this.simTimer);
      this.simTimer = null;
    }
  }
}

