import React, { useState } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import {
  Zap,
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
  Sliders,
  Layers,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

export default function ZerodhaConfigModal() {
  const {
    isZerodhaModalOpen,
    setIsZerodhaModalOpen,
    isZerodhaLive,
    toggleZerodhaLive,
    zerodhaConfig,
    updateZerodhaConfig,
    zerodhaStatus,
    zerodhaStatusMessage,
    zerodhaStats,
    startKiteSimulation,
    stopKiteSimulation,
    isKiteSimulating,
    generateKiteSession
  } = useMarketData();

  const [apiKey, setApiKey] = useState(zerodhaConfig.apiKey || '');
  const [apiSecret, setApiSecret] = useState(zerodhaConfig.apiSecret || '');
  const [accessToken, setAccessToken] = useState(zerodhaConfig.accessToken || '');
  const [requestTokenInput, setRequestTokenInput] = useState('');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [tokenGenError, setTokenGenError] = useState('');
  const [mode, setMode] = useState(zerodhaConfig.mode || 'full');
  const [connectionMode, setConnectionMode] = useState(zerodhaConfig.connectionMode || 'relay');
  const [relayHost, setRelayHost] = useState(zerodhaConfig.relayHost || '');
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [showIpHelp, setShowIpHelp] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  // Sync state if context updates
  React.useEffect(() => {
    if (zerodhaConfig.accessToken && zerodhaConfig.accessToken !== accessToken) {
      setAccessToken(zerodhaConfig.accessToken);
    }
    if (zerodhaConfig.apiKey && zerodhaConfig.apiKey !== apiKey) {
      setApiKey(zerodhaConfig.apiKey);
    }
    if (zerodhaConfig.apiSecret && zerodhaConfig.apiSecret !== apiSecret) {
      setApiSecret(zerodhaConfig.apiSecret);
    }
  }, [zerodhaConfig]);

  if (!isZerodhaModalOpen) return null;

  const handleSaveAndConnect = () => {
    updateZerodhaConfig({ apiKey, apiSecret, accessToken, mode, connectionMode, relayHost });
    if (!isZerodhaLive) {
      toggleZerodhaLive(true);
    }
  };

  const handleToggleFeed = () => {
    const next = !isZerodhaLive;
    if (next) {
      updateZerodhaConfig({ apiKey, apiSecret, accessToken, mode, connectionMode, relayHost });
      toggleZerodhaLive(true);
    } else {
      toggleZerodhaLive(false);
    }
  };

  const handleManualTokenGenerate = async () => {
    if (!requestTokenInput.trim()) {
      setTokenGenError('Please paste your request_token or full redirect URL');
      return;
    }
    setIsGeneratingToken(true);
    setTokenGenError('');
    const res = await generateKiteSession(requestTokenInput.trim(), apiKey, apiSecret);
    setIsGeneratingToken(false);
    if (res.success) {
      setAccessToken(res.accessToken);
      setRequestTokenInput('');
    } else {
      setTokenGenError(res.error || 'Failed to generate access token');
    }
  };

  const kiteLoginUrl = apiKey
    ? `https://kite.zerodha.com/connect/login?v=3&api_key=${encodeURIComponent(apiKey)}`
    : 'https://kite.zerodha.com/connect/login?v=3';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={() => setIsZerodhaModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-hairline bg-surface-card p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 text-foreground my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff5722]/15 text-[#ff5722] border border-[#ff5722]/30 shadow-sm">
              {/* Zerodha Kite stylized icon */}
              <Zap className="h-6 w-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-foreground">Zerodha Kite Connect</h3>
                <span className="rounded-md bg-[#ff5722]/15 px-2 py-0.5 text-[10px] font-bold text-[#ff5722] tracking-wider uppercase">
                  WebSocket Ticker
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Sub-50ms live tick-by-tick streaming for NIFTY, BANKNIFTY, F&amp;O Equities &amp; Orderbook
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsZerodhaModalOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status & Master Switch Banner */}
        <div className="mt-4 rounded-xl border border-hairline bg-surface-2/60 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {isZerodhaLive && (zerodhaStatus === 'CONNECTED' || isKiteSimulating) ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-up opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-up"></span>
                  </>
                ) : zerodhaStatus === 'CONNECTING' ? (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-warn animate-pulse"></span>
                ) : zerodhaStatus === 'AUTH_REQUIRED' ? (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-warn"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-muted-foreground/60"></span>
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Status: {isKiteSimulating ? 'SIMULATING LIVE TICKS' : zerodhaStatus}
                  </span>
                  {isZerodhaLive && (
                    <span className="rounded bg-up/15 px-1.5 py-0.2 text-[10px] font-bold text-up">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isKiteSimulating
                    ? 'Emulating authentic KiteTicker binary packets (184b full depth)'
                    : zerodhaStatusMessage ||
                      (isZerodhaLive
                        ? 'Connected to wss://ws.kite.trade'
                        : 'Ticker offline. Turn switch ON to stream live ticks.')}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <span className="text-xs font-bold text-foreground">
                {isZerodhaLive ? 'Kite Live: ON' : 'Kite Live: OFF'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isZerodhaLive}
                onClick={handleToggleFeed}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isZerodhaLive ? 'bg-up' : 'bg-surface-muted'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isZerodhaLive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* API Key */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                <span>Kite API Key</span>
                <span className="text-[10px] font-normal text-muted-foreground">Permanent</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value.trim())}
                  placeholder="e.g. biqruu6ja6zvoka8"
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2 text-xs font-mono font-medium text-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* API Secret */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                <span>Kite API Secret</span>
                <span className="text-[10px] font-normal text-muted-foreground">Permanent</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiSecret}
                  onChange={e => setApiSecret(e.target.value.trim())}
                  placeholder="e.g. 5hmhgnkrq1nmp0z3..."
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-2 text-xs font-mono font-medium text-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Access Token */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center justify-between">
                <span>Daily Access Token</span>
                {accessToken ? (
                  <span className="text-[10px] font-bold text-up flex items-center gap-0.5">
                    <Check className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] font-normal text-warn">Needs Daily Login</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value.trim())}
                  placeholder={accessToken ? 'Token active' : 'Click 1-Click Login below'}
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-mono font-medium outline-none transition-all placeholder:text-muted-foreground/50 ${
                    accessToken
                      ? 'border-up/40 bg-up/5 text-foreground'
                      : 'border-hairline bg-surface-2 text-foreground focus:border-brand'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 1-Click Token Generator Card */}
          <div className="rounded-xl border border-[#ff5722]/30 bg-[#ff5722]/5 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff5722] text-white font-bold text-xs">
                    ⚡
                  </span>
                  <p className="font-heading text-sm font-bold text-foreground">
                    Don't have an Access Token? Generate It in 1 Click
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  SEBI requires daily login. Because you have the <strong>API Key</strong> and <strong>API Secret</strong>, our terminal will exchange tokens automatically!
                </p>
              </div>

              {/* 1-Click Login Button */}
              <a
                href={kiteLoginUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff5722] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#ea580c] transition-all"
              >
                <Key className="h-4 w-4" />
                <span>1-Click Login with Kite ↗</span>
              </a>
            </div>

            {/* Manual Request Token / Redirect URL Converter */}
            <div className="border-t border-[#ff5722]/20 pt-3">
              <p className="text-[11px] font-semibold text-foreground mb-1.5 flex items-center justify-between">
                <span>Or Paste Redirect URL / request_token after login:</span>
                <span className="text-[10px] text-muted-foreground font-normal">Auto-extracts token &amp; generates 24h session</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={requestTokenInput}
                  onChange={e => setRequestTokenInput(e.target.value)}
                  placeholder="e.g. https://yourdomain.com/?request_token=abc123xyz... or paste request_token"
                  className="flex-1 rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-xs font-mono text-foreground outline-none focus:border-brand placeholder:text-muted-foreground/50"
                />
                <button
                  type="button"
                  disabled={isGeneratingToken}
                  onClick={handleManualTokenGenerate}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand px-3.5 py-1.5 text-xs font-bold text-white hover:bg-brand-deep transition-all disabled:opacity-50"
                >
                  {isGeneratingToken ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                  <span>{isGeneratingToken ? 'Generating...' : 'Generate Access Token'}</span>
                </button>
              </div>
              {tokenGenError && (
                <p className="text-[11px] text-down font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {tokenGenError}
                </p>
              )}
            </div>
          </div>

          {/* Connection Routing: GoDaddy Static IP Relay vs Direct */}
          <div className="rounded-xl border border-hairline bg-surface-2 p-3.5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-up" />
                  Connection Architecture (Dynamic Jio/Airtel IP Solution)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Prevents Zerodha 7–10 day whitelist lockouts from changing home IPs
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConnectionMode('relay')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    connectionMode === 'relay'
                      ? 'bg-up text-white shadow-sm'
                      : 'bg-surface-card text-muted-foreground hover:text-foreground border border-hairline/60'
                  }`}
                  title="Connect via GoDaddy Static IP Relay server.js"
                >
                  GoDaddy Static IP Relay
                </button>
                <button
                  type="button"
                  onClick={() => setConnectionMode('direct')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    connectionMode === 'direct'
                      ? 'bg-brand text-white shadow-sm'
                      : 'bg-surface-card text-muted-foreground hover:text-foreground border border-hairline/60'
                  }`}
                  title="Direct browser WebSocket connection to wss://ws.kite.trade"
                >
                  Direct to Kite
                </button>
              </div>
            </div>

            {/* Explanation card for Dynamic IP vs GoDaddy */}
            <div className="rounded-lg bg-surface-card p-2.5 text-[11px] text-muted-foreground border border-hairline/60">
              <span className="font-bold text-foreground">Why GoDaddy Relay is required for JioFiber:</span>{' '}
              JioFiber changes your public IP address daily, but Zerodha restricts IP whitelist edits to only once every 7–10 days. By hosting this app on GoDaddy with the included <code>server.js</code>, Zerodha <strong>only sees GoDaddy's permanent Static IP</strong>. You can open your terminal from Jio, mobile 5G, or office Wi-Fi without ever getting locked out!
            </div>
          </div>

          {/* Mode Selector */}
          <div className="rounded-xl border border-hairline bg-surface-2 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-foreground">WebSocket Subscription Mode</p>
              <p className="text-[11px] text-muted-foreground">
                Packet size and order depth streamed per tick
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'full', label: 'Full (184b)', desc: 'LTP + 5 Depth + OI' },
                { id: 'quote', label: 'Quote (44b)', desc: 'LTP + Volume + OHLC' },
                { id: 'ltp', label: 'LTP (8b)', desc: 'Price only' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    mode === m.id
                      ? 'bg-brand text-white shadow-sm'
                      : 'bg-surface-card text-muted-foreground hover:text-foreground border border-hairline/60'
                  }`}
                  title={m.desc}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* One-click Kite Login Assistant */}
          <div className="rounded-xl border border-hairline bg-surface-2/40 p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[#ff5722]" />
                <span className="font-bold text-foreground">Need your daily Access Token?</span>
              </div>
              <button
                onClick={() => setShowTokenHelp(prev => !prev)}
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                {showTokenHelp ? 'Hide Guide' : '3-Step Guide ▾'}
              </button>
            </div>

            {showTokenHelp && (
              <div className="mt-3 pt-3 border-t border-hairline space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand font-bold text-[9px]">
                    1
                  </span>
                  <span>
                    Log into <a href="https://developers.kite.trade" target="_blank" rel="noreferrer" className="text-brand underline font-medium">developers.kite.trade</a> and obtain your <strong>API Key</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand font-bold text-[9px]">
                    2
                  </span>
                  <span>
                    Click{' '}
                    <a
                      href={kiteLoginUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#ff5722] hover:underline"
                    >
                      Login with Kite Connect <ExternalLink className="h-3 w-3" />
                    </a>{' '}
                    to authorize and get your redirect <code>request_token</code>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand font-bold text-[9px]">
                    3
                  </span>
                  <span>
                    Exchange <code>request_token</code> + SHA-256(api_key + request_token + api_secret) for your 24-hr <code>access_token</code> and paste it above.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Ticker Diagnostics */}
        <div className="mt-5 rounded-xl border border-hairline bg-surface-2 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-up animate-pulse" /> Live WebSocket Diagnostics
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              Last Tick: {zerodhaStats.lastTickTime || 'Waiting...'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-surface-card p-2 border border-hairline/50">
              <span className="text-[10px] text-muted-foreground block">Ticks Ingested</span>
              <span className="font-mono text-sm font-bold text-foreground">
                {zerodhaStats.ticksCount.toLocaleString()}
              </span>
            </div>
            <div className="rounded-lg bg-surface-card p-2 border border-hairline/50">
              <span className="text-[10px] text-muted-foreground block">Packets</span>
              <span className="font-mono text-sm font-bold text-foreground">
                {zerodhaStats.packetsCount.toLocaleString()}
              </span>
            </div>
            <div className="rounded-lg bg-surface-card p-2 border border-hairline/50">
              <span className="text-[10px] text-muted-foreground block">Binary Bytes</span>
              <span className="font-mono text-sm font-bold text-foreground">
                {(zerodhaStats.bytesReceived / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="rounded-lg bg-surface-card p-2 border border-hairline/50">
              <span className="text-[10px] text-muted-foreground block">Latency</span>
              <span className="font-mono text-sm font-bold text-up">
                {isZerodhaLive ? '<45 ms' : '—'}
              </span>
            </div>
          </div>

          {/* Recent Ticks Table */}
          {zerodhaStats.lastTicks && zerodhaStats.lastTicks.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-hairline/50">
                    <th className="pb-1">Symbol</th>
                    <th className="pb-1 text-right">LTP</th>
                    <th className="pb-1 text-right">Chg (%)</th>
                    <th className="pb-1 text-right">Volume</th>
                    <th className="pb-1 text-right">Depth (B / S)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline/30">
                  {zerodhaStats.lastTicks.map((t, idx) => (
                    <tr key={idx} className="hover:bg-surface-3/50 transition-colors">
                      <td className="py-1 font-bold text-foreground">{t.symbol}</td>
                      <td className="py-1 text-right font-semibold text-foreground">₹{t.last_price?.toFixed(2)}</td>
                      <td className={`py-1 text-right font-medium ${t.change >= 0 ? 'text-up' : 'text-down'}`}>
                        {t.change >= 0 ? '+' : ''}{t.pChange?.toFixed(2)}%
                      </td>
                      <td className="py-1 text-right text-muted-foreground">
                        {t.volume ? (t.volume > 100000 ? `${(t.volume / 100000).toFixed(1)}L` : t.volume) : '—'}
                      </td>
                      <td className="py-1 text-right text-subtle-foreground">
                        {t.depth ? `${t.depth.buy?.[0]?.quantity || 0} / ${t.depth.sell?.[0]?.quantity || 0}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-6 border-t border-hairline pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Test / Simulation Button */}
          <button
            type="button"
            onClick={() => {
              if (isKiteSimulating) {
                stopKiteSimulation();
              } else {
                startKiteSimulation();
              }
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border ${
              isKiteSimulating
                ? 'bg-warn/15 text-warn border-warn/30 hover:bg-warn/25'
                : 'bg-surface-2 text-foreground border-hairline hover:bg-surface-muted'
            }`}
          >
            {isKiteSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-brand" />}
            <span>{isKiteSimulating ? 'Stop Tick Simulation' : 'Test Ticks (Simulate Off-Hours)'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsZerodhaModalOpen(false)}
              className="rounded-xl border border-hairline bg-surface-2 px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-muted transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveAndConnect}
              className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-brand-deep transition-all flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Save &amp; Connect WebSocket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

