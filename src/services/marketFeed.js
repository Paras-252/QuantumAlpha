// Market Feed Service - Manages Live NSE HTTP Polling & Optional Broker WebSocket Streaming
import { getNSEMarketHours, generateOptionChain } from '../data/marketData';

export class MarketFeedService {
  constructor({ onPulseUpdate, onOptionsUpdate, onFlowUpdate, onTick, onError }) {
    this.onPulseUpdate = onPulseUpdate;
    this.onOptionsUpdate = onOptionsUpdate;
    this.onFlowUpdate = onFlowUpdate;
    this.onTick = onTick;
    this.onError = onError;

    this.ws = null;
    this.wsStatus = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
    this.feedSource = localStorage.getItem('tredye.feedSource') || 'tredye_cloud'; // 'tredye_cloud' | 'broker_ws'
    this.brokerConfig = JSON.parse(localStorage.getItem('tredye.brokerConfig') || '{"broker":"custom","wsUrl":"","token":""}');

    this.pulseTimer = null;
    this.optionsTimer = null;
    this.activeOptionSymbol = 'NIFTY';
    this.activeOptionExpiry = null;
  }

  start() {
    this.startPolling();
    if (this.feedSource === 'broker_ws' && this.brokerConfig.wsUrl) {
      this.connectBrokerWebSocket();
    }
  }

  stop() {
    if (this.pulseTimer) clearInterval(this.pulseTimer);
    if (this.optionsTimer) clearInterval(this.optionsTimer);
    this.disconnectBrokerWebSocket();
  }

  // 1. Tredye Cloud API Polling (Matches official refresh config: 17s pulse, 62s options)
  startPolling() {
    const marketHours = getNSEMarketHours();
    const pulseInterval = marketHours.isOpen ? 17000 : 300000; // 17s during live hours, 5m after hours
    const optionsInterval = marketHours.isOpen ? 62000 : 600000;

    this.fetchPulse();
    this.pulseTimer = setInterval(() => this.fetchPulse(), pulseInterval);

    this.fetchOptions(this.activeOptionSymbol, this.activeOptionExpiry);
    this.optionsTimer = setInterval(() => {
      this.fetchOptions(this.activeOptionSymbol, this.activeOptionExpiry);
    }, optionsInterval);
  }

  async fetchPulse() {
    try {
      const res = await fetch('https://data.tredye.com/data/pulse.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const data = await res.json();
      if (this.onPulseUpdate && data) {
        this.onPulseUpdate(data);
      }
    } catch (e) {
      if (this.onError) this.onError(e);
    }
  }

  async fetchOptions(symbol = 'NIFTY', expiry = null) {
    this.activeOptionSymbol = symbol;
    this.activeOptionExpiry = expiry;
    try {
      const symUpper = symbol.toUpperCase();
      const url = `https://data.tredye.com/data/options@symbol-${symUpper}.json`;
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) {
        // Fallback to local option generator
        const fallback = generateOptionChain(symbol, expiry);
        if (this.onOptionsUpdate) this.onOptionsUpdate(fallback);
        return;
      }
      const raw = await res.json();
      if (this.onOptionsUpdate && raw) {
        const spot = raw.spot || 25030.35;
        const atmIv = raw.atm_iv || 18.5;
        const step = symUpper === 'BANKNIFTY' ? 100 : symUpper === 'NIFTY' ? 50 : 20;

        const chain = (raw.bars || []).map(r => ({
          strike: r.k,
          isAtm: Math.abs(r.k - spot) < step,
          call: {
            oi: r.coi,
            oiChg: r.cchg,
            ltp: r.cl != null ? r.cl : +(Math.max(0, spot - r.k) * 0.9 + 25).toFixed(1),
            iv: r.civ != null ? r.civ : atmIv,
            delta: r.cd != null ? r.cd : +(Math.max(0.05, Math.min(0.95, 0.5 + (spot - r.k) / (step * 20)))).toFixed(2)
          },
          put: {
            oi: r.poi,
            oiChg: r.pchg,
            ltp: r.pl != null ? r.pl : +(Math.max(0, r.k - spot) * 0.9 + 25).toFixed(1),
            iv: r.piv != null ? r.piv : atmIv,
            delta: r.pd != null ? r.pd : -(Math.max(0.05, Math.min(0.95, 0.5 + (r.k - spot) / (step * 20)))).toFixed(2)
          }
        }));

        this.onOptionsUpdate({
          symbol: symUpper,
          spot: raw.spot,
          chg: raw.chg,
          chg_pct: raw.chg_pct,
          expiry: raw.expiry,
          expiries: raw.expiries || [raw.expiry],
          max_pain: raw.max_pain,
          atm_iv: raw.atm_iv,
          straddle: raw.straddle,
          pcr: raw.pcr,
          pcr_chg: raw.pcr_chg,
          callWall: raw.walls ? raw.walls[1] : 26000,
          putWall: raw.walls ? raw.walls[0] : 24000,
          verdict: raw.verdict || "Strong put floor defending downside dips.",
          bullets: raw.bullets || [],
          smile: raw.smile || [],
          chain_ts: raw.chain_ts || "Live Snapshot",
          chain
        });
      }
    } catch (e) {
      const fallback = generateOptionChain(symbol, expiry);
      if (this.onOptionsUpdate) this.onOptionsUpdate(fallback);
    }
  }

  // 2. Broker WebSocket Connector (Zerodha Kite, Dhan, Angel One, Upstox, or Custom WebSocket)
  connectBrokerWebSocket() {
    if (!this.brokerConfig.wsUrl) return;

    try {
      this.wsStatus = 'CONNECTING';
      this.ws = new WebSocket(this.brokerConfig.wsUrl);

      this.ws.onopen = () => {
        this.wsStatus = 'CONNECTED';
        // Send auth / subscription if token provided
        if (this.brokerConfig.token) {
          this.ws.send(JSON.stringify({
            action: 'subscribe',
            token: this.brokerConfig.token,
            symbols: ['NIFTY 50', 'BANKNIFTY', 'RELIANCE', 'HDFCBANK']
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (this.onTick && packet) {
            this.onTick(packet);
          }
        } catch (e) {}
      };

      this.ws.onerror = () => {
        this.wsStatus = 'ERROR';
      };

      this.ws.onclose = () => {
        this.wsStatus = 'DISCONNECTED';
      };
    } catch (e) {
      this.wsStatus = 'ERROR';
    }
  }

  disconnectBrokerWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.wsStatus = 'DISCONNECTED';
    }
  }

  setFeedSource(source, config = null) {
    this.feedSource = source;
    localStorage.setItem('tredye.feedSource', source);

    if (config) {
      this.brokerConfig = config;
      localStorage.setItem('tredye.brokerConfig', JSON.stringify(config));
    }

    if (source === 'broker_ws') {
      this.connectBrokerWebSocket();
    } else {
      this.disconnectBrokerWebSocket();
    }
  }
}

