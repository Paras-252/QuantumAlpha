import React, { useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Sparkles,
  Search,
  Calendar,
  Info,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpRight,
  Clock,
  X
} from 'lucide-react';

export default function LiquidityView() {
  const { marketStatus, setActiveChartSymbol } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('17-Nov-2026');
  const [selectedTf, setSelectedTf] = useState('15m');
  const [showExplanation, setShowExplanation] = useState(false);

  // Active feature toggles
  const [toggles, setToggles] = useState({
    oiWalls: true,
    volumeProfile: true,
    futuresBuildup: true,
    maxPain: true,
    vwap: true,
    delivery: false
  });

  const primarySymbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'HDFCBANK', 'LICI', 'SBIN', 'BTC', 'ETH'];

  // Timeframe buttons
  const timeframes = ['5m', '15m', '1h', '1D'];

  // Toggle helper
  const toggleFeature = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Top Algorithmic Headline Banner matching Image 3 */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">
              Liquidity Map
            </span>
            <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Price 25,030 is boxed between put sellers at 24,500 and call sellers at 25,500; futures show bullish buildup.
            </h1>
          </div>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline/80 bg-surface-2 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>What am I looking at?</span>
          </button>
        </div>

        {showExplanation && (
          <div className="mt-3.5 pt-3.5 border-t border-hairline text-xs text-muted-foreground leading-relaxed">
            The Liquidity Map visualizes where large institutional limit orders (call and put option walls), volume clusters (Volume Profile POC, HVN, LVN), and intraday futures buildup concentrate. The price is pulled toward high liquidity and repelled by heavy writer resistance.
          </div>
        )}
      </div>

      {/* 2. Symbol & Expiry Bar matching Image 3 */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-hairline shadow-xs">
          {primarySymbols.map(sym => {
            const isActive = selectedSymbol === sym;
            return (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-surface-2 text-foreground font-bold shadow-xs border border-hairline/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {sym}
              </button>
            );
          })}

          <div className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
            <Search className="h-3 w-3" />
            <span>Search</span>
          </div>

          <div className="ml-1 pl-2 border-l border-hairline flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedExpiry}
              onChange={e => setSelectedExpiry(e.target.value)}
              className="bg-transparent font-mono text-xs font-semibold text-foreground outline-none cursor-pointer pr-1"
            >
              <option value="17-Nov-2026">17-Nov-2026</option>
              <option value="24-Nov-2026">24-Nov-2026</option>
              <option value="01-Dec-2026">01-Dec-2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Top 3 Circle Gauge KPI Cards matching Image 3 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* Card 1: SUPPORT */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex items-center gap-4">
          {/* Ring Gauge 43 */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="5" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#16a34a"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={(2 * Math.PI * 26) * (1 - 0.43)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-mono text-base font-black text-foreground">43</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>SUPPORT</span>
              <Info className="h-3 w-3 text-muted-foreground/70" />
            </div>
            <div className="font-mono text-2xl font-black text-foreground mt-0.5">
              24,500
            </div>
            <span className="text-xs text-muted-foreground font-medium">Moderate</span>
          </div>
        </div>

        {/* Card 2: RESISTANCE */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex items-center gap-4">
          {/* Ring Gauge 57 */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="5" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#dc2626"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={(2 * Math.PI * 26) * (1 - 0.57)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-mono text-base font-black text-foreground">57</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>RESISTANCE</span>
              <Info className="h-3 w-3 text-muted-foreground/70" />
            </div>
            <div className="font-mono text-2xl font-black text-foreground mt-0.5">
              25,500
            </div>
            <span className="text-xs text-muted-foreground font-medium">Strong</span>
          </div>
        </div>

        {/* Card 3: BUILDUP */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex items-center gap-4">
          {/* Ring Gauge 67 */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="5" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#16a34a"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={(2 * Math.PI * 26) * (1 - 0.67)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-mono text-base font-black text-foreground">67</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>BUILDUP</span>
              <Info className="h-3 w-3 text-muted-foreground/70" />
            </div>
            <div className="flex items-center gap-1.5 font-heading text-xl font-black text-up mt-0.5">
              <ArrowUpRight className="h-5 w-5 stroke-[3]" />
              <span>Bullish</span>
            </div>
            <p className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
              last 12 bars: 9 long-side, 3 short-side; today's option writers: puts
            </p>
          </div>
        </div>
      </div>

      {/* 4. Main Chart Card: Price · where the big money sits matching Image 3 */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
        {/* Top bar with Legend & Last Session */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-hairline/60">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span>Price · where the big money sits</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>

            {/* Buildup legend */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                <span>Long buildup</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#dc2626]" />
                <span>Short buildup</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#06b6d4]" />
                <span>Short covering</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                <span>Long unwinding</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>Last session · 06-Nov-2026 15:40</span>
          </div>
        </div>

        {/* Filter / Toggle pills row */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-hairline/50 text-xs">
          {/* Timeframe pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-2 border border-hairline">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTf(tf)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  selectedTf === tf
                    ? 'bg-surface-card text-foreground font-bold shadow-xs border border-hairline'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Feature toggle buttons with dots */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => toggleFeature('oiWalls')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                toggles.oiWalls ? 'bg-surface-2 text-foreground border-hairline' : 'opacity-40 border-transparent text-muted-foreground'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-down" />
              <span>Option OI walls</span>
            </button>

            <button
              onClick={() => toggleFeature('volumeProfile')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                toggles.volumeProfile ? 'bg-surface-2 text-foreground border-hairline' : 'opacity-40 border-transparent text-muted-foreground'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Volume profile</span>
            </button>

            <button
              onClick={() => toggleFeature('futuresBuildup')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                toggles.futuresBuildup ? 'bg-surface-2 text-foreground border-hairline' : 'opacity-40 border-transparent text-muted-foreground'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-up" />
              <span>Futures buildup</span>
            </button>

            <button
              onClick={() => toggleFeature('maxPain')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                toggles.maxPain ? 'bg-surface-2 text-foreground border-hairline' : 'opacity-40 border-transparent text-muted-foreground'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
              <span>Max pain &amp; writers' range</span>
            </button>

            <button
              onClick={() => toggleFeature('vwap')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                toggles.vwap ? 'bg-surface-2 text-foreground border-hairline' : 'opacity-40 border-transparent text-muted-foreground'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>VWAP &amp; anchored VWAP</span>
            </button>

            <button
              onClick={() => toggleFeature('delivery')}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                toggles.delivery ? 'bg-surface-2 text-foreground border-hairline' : 'opacity-40 border-transparent text-muted-foreground'
              }`}
            >
              <span className="h-2 w-2 rounded-full border border-muted-foreground" />
              <span>Delivery %</span>
            </button>
          </div>
        </div>

        {/* Interactive Chart Canvas matching Image 3 */}
        <div className="relative py-4 w-full h-[400px] select-none overflow-hidden">
          <svg viewBox="0 0 1000 400" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Horizontal Gridlines & Price Ticks */}
            {[22600, 23000, 23400, 23800, 24200, 24600, 25030, 25500, 26000].map(p => {
              const y = 370 - ((p - 22600) / (26200 - 22600)) * 340;
              return (
                <g key={p}>
                  <line x1="50" y1={y} x2="940" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <text x="948" y={y + 3.5} className="fill-muted-foreground text-[10px] font-mono font-medium">
                    {p.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Left Side: Volume Profile Bars (Gray) */}
            {toggles.volumeProfile && (
              <g opacity="0.35">
                {[
                  { y: 340, w: 90 }, { y: 320, w: 120 }, { y: 300, w: 140 }, { y: 280, w: 110 },
                  { y: 260, w: 170, poc: true }, { y: 240, w: 100 }, { y: 220, w: 80 }, { y: 200, w: 70 },
                  { y: 180, w: 85 }, { y: 150, w: 60 }, { y: 120, w: 45 }, { y: 90, w: 35 }
                ].map((bar, i) => (
                  <g key={i}>
                    <rect x="50" y={bar.y - 6} width={bar.w} height="12" fill={bar.poc ? "#475569" : "#94a3b8"} rx="1" />
                    {bar.poc && (
                      <text x={bar.w + 58} y={bar.y + 3.5} className="fill-foreground font-mono text-[9px] font-bold">
                        POC (time-at-price) 23,679.9
                      </text>
                    )}
                  </g>
                ))}
              </g>
            )}

            {/* Right Side: Option OI Distribution Bars */}
            {toggles.oiWalls && (
              <g opacity="0.6">
                {/* Heavy Call OI near 25500 and 26000 */}
                <rect x="880" y="55" width="55" height="7" fill="#ef4444" rx="1" />
                <rect x="860" y="68" width="75" height="7" fill="#ef4444" rx="1" />
                <rect x="840" y="80" width="95" height="7" fill="#ef4444" rx="1" />
                <rect x="895" y="100" width="40" height="7" fill="#ef4444" rx="1" />
                <rect x="885" y="125" width="50" height="7" fill="#ef4444" rx="1" />

                {/* Heavy Put OI near 24500, 24000, 23000 */}
                <rect x="870" y="165" width="65" height="7" fill="#22c55e" rx="1" />
                <rect x="850" y="180" width="85" height="7" fill="#22c55e" rx="1" />
                <rect x="890" y="215" width="45" height="7" fill="#22c55e" rx="1" />
                <rect x="865" y="240" width="70" height="7" fill="#22c55e" rx="1" />
                <rect x="845" y="275" width="90" height="7" fill="#22c55e" rx="1" />
                <rect x="875" y="315" width="60" height="7" fill="#22c55e" rx="1" />
              </g>
            )}

            {/* Anchored VWAP Dashed Blue Line */}
            {toggles.vwap && (
              <>
                <line x1="80" y1="355" x2="930" y2="245" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="4 4" />
                {/* Intraday VWAP Stepping Line */}
                <path
                  d="M 80 355 Q 220 330 350 310 T 520 270 T 700 230 T 820 185 L 900 135"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2.2"
                />
              </>
            )}

            {/* Stepped Candlesticks / Price Action rising from 22600 to 25030 */}
            <g>
              {/* Stepping breakout candles */}
              {[
                { x: 90, o: 358, c: 352, h: 360, l: 350, up: true },
                { x: 120, o: 352, c: 345, h: 355, l: 342, up: true },
                { x: 150, o: 345, c: 348, h: 350, l: 344, up: false },
                { x: 180, o: 348, c: 340, h: 350, l: 338, up: true },
                { x: 210, o: 340, c: 335, h: 342, l: 333, up: true },
                { x: 240, o: 335, c: 338, h: 340, l: 334, up: false },
                { x: 270, o: 338, c: 315, h: 340, l: 310, up: true }, // Big breakout
                { x: 300, o: 315, c: 312, h: 318, l: 310, up: true },
                { x: 340, o: 312, c: 314, h: 316, l: 311, up: false },
                { x: 380, o: 314, c: 312, h: 315, l: 310, up: true },
                { x: 420, o: 312, c: 290, h: 314, l: 288, up: true }, // Breakout step 2
                { x: 460, o: 290, c: 294, h: 295, l: 289, up: false },
                { x: 500, o: 294, c: 292, h: 296, l: 290, up: true },
                { x: 540, o: 292, c: 298, h: 300, l: 291, up: false },
                { x: 590, o: 298, c: 235, h: 300, l: 232, up: true }, // Big gap breakout
                { x: 630, o: 235, c: 238, h: 240, l: 234, up: false },
                { x: 670, o: 238, c: 236, h: 240, l: 234, up: true },
                { x: 720, o: 236, c: 228, h: 238, l: 226, up: true },
                { x: 760, o: 228, c: 215, h: 230, l: 213, up: true },
                { x: 800, o: 215, c: 205, h: 218, l: 202, up: true },
                { x: 840, o: 205, c: 195, h: 208, l: 192, up: true },
                { x: 870, o: 195, c: 175, h: 198, l: 172, up: true },
                { x: 895, o: 175, c: 135, h: 178, l: 133, up: true } // Highest candle hitting 25,030
              ].map((c, i) => (
                <g key={i}>
                  <line x1={c.x} y1={c.h} x2={c.x} y2={c.l} stroke={c.up ? "#16a34a" : "#dc2626"} strokeWidth="1.2" />
                  <rect
                    x={c.x - 3}
                    y={Math.min(c.o, c.c)}
                    width="6"
                    height={Math.max(2, Math.abs(c.o - c.c))}
                    fill={c.up ? "#16a34a" : "#dc2626"}
                    rx="0.5"
                  />
                </g>
              ))}
            </g>

            {/* Liquidity Wall Badges & Labels matching Image 3 */}
            {/* 1. Big call sellers 26,000 */}
            <g>
              <line x1="310" y1="52" x2="880" y2="52" stroke="#ef4444" strokeOpacity="0.4" strokeDasharray="2 2" />
              <rect x="300" y="44" width="130" height="17" fill="#fef2f2" stroke="#f87171" rx="4" className="dark:fill-rose-950 dark:stroke-rose-800" />
              <text x="365" y="56" textAnchor="middle" className="fill-rose-600 dark:fill-rose-300 font-mono text-[9.5px] font-bold">
                ▲ Big call sellers 26,000
              </text>
            </g>

            {/* 2. Max pain 24,500 */}
            {toggles.maxPain && (
              <g>
                <line x1="50" y1="180" x2="880" y2="180" stroke="#8b5cf6" strokeOpacity="0.3" strokeDasharray="3 3" />
                <rect x="415" y="172" width="95" height="16" fill="#f5f3ff" stroke="#c084fc" rx="4" className="dark:fill-purple-950 dark:stroke-purple-800" />
                <text x="462" y="184" textAnchor="middle" className="fill-purple-600 dark:fill-purple-300 font-mono text-[9.5px] font-bold">
                  ● Max pain 24,500
                </text>
              </g>
            )}

            {/* 3. Big put sellers @ 24,500 */}
            <g>
              <line x1="770" y1="180" x2="920" y2="180" stroke="#16a34a" strokeOpacity="0.5" />
              <text x="775" y="195" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[9.5px] font-bold">
                ● Big put sellers @ 24,500
              </text>
            </g>

            {/* 4. Big put sellers @ 24,000 */}
            <g>
              <line x1="770" y1="230" x2="920" y2="230" stroke="#16a34a" strokeOpacity="0.5" />
              <text x="775" y="245" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[9.5px] font-bold">
                ● Big put sellers @ 24,000
              </text>
            </g>

            {/* 5. Big put sellers @ 23,000 */}
            <g>
              <line x1="710" y1="315" x2="920" y2="315" stroke="#16a34a" strokeOpacity="0.5" />
              <text x="715" y="328" className="fill-emerald-600 dark:fill-emerald-400 font-mono text-[9.5px] font-bold">
                ● Big put sellers @ 23,000
              </text>
            </g>

            {/* Spot Price Green Badge on Right Axis */}
            <g>
              <rect x="946" y="125" width="50" height="18" fill="#16a34a" rx="3" />
              <text x="971" y="137.5" textAnchor="middle" className="fill-white font-mono text-[10.5px] font-bold">
                25030
              </text>
            </g>
          </svg>
        </div>

        {/* 5. Futures Buildup Timeline Bar & Markers matching Image 3 */}
        <div className="pt-2 border-t border-hairline/60">
          <div className="flex h-3 w-full rounded-xs overflow-hidden gap-[1px]">
            {/* Color-coded segments: green=long buildup, red=short buildup, cyan=short covering, orange=long unwinding */}
            {[
              '#f97316', '#16a34a', '#16a34a', '#dc2626', '#06b6d4', '#f97316', '#16a34a', '#16a34a',
              '#dc2626', '#16a34a', '#06b6d4', '#16a34a', '#16a34a', '#16a34a', '#f97316', '#dc2626',
              '#16a34a', '#16a34a', '#06b6d4', '#16a34a', '#16a34a', '#f97316', '#16a34a', '#16a34a',
              '#dc2626', '#16a34a', '#16a34a', '#06b6d4', '#16a34a', '#16a34a', '#16a34a', '#16a34a'
            ].map((col, idx) => (
              <div key={idx} className="flex-1 h-full" style={{ backgroundColor: col }} />
            ))}
          </div>

          {/* Time markers */}
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono font-medium pt-1 px-1">
            <span>Oct</span>
            <span>11:30</span>
            <span>13:30</span>
            <span>Nov</span>
            <span>11:30</span>
            <span>13:30</span>
            <span>3 Nov</span>
            <span>11:30</span>
            <span>13:30</span>
            <span>4 Nov</span>
            <span>11:30</span>
            <span>13:30</span>
            <span>5 Nov</span>
            <span>11:30</span>
            <span>13:30</span>
            <span>6 Nov</span>
            <span>11:30</span>
            <span>14:30</span>
          </div>
        </div>

        {/* Footnote notes matching Image 3 */}
        <div className="pt-3 mt-3 border-t border-hairline/50 text-[10.5px] text-muted-foreground leading-relaxed">
          candles: Yahoo Finance (~15 min delayed intraday) · options: NSE option chain (public) · buildup: intraday NSE futures OI snapshots stored by Quantum Alpha (310 bars); other bars coloured by that day's daily futures buildup (dimmed) · index has no volume → profile/VWAP use time-at-price · options expiry 17-Nov-2026 · tap the chart to anchor VWAP
        </div>
      </div>
    </div>
  );
}
