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
  Clock,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward
} from 'lucide-react';

export default function OIFlowView() {
  const { marketStatus, setActiveChartSymbol } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('17-Nov-2026');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState('1x');
  const [showExplanation, setShowExplanation] = useState(false);

  const primarySymbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'HDFCBANK', 'LICI', 'SBIN', 'INFY'];
  const speeds = ['0.5x', '1x', '2x', '4x', '8x'];

  // Strike ladder rows from 24,350 to 25,750
  const strikes = [
    { k: 25750, put: 10, call: 65, pType: 'unwinding', cType: 'covering' },
    { k: 25700, put: 12, call: 180, pType: 'unwinding', cType: 'covering' },
    { k: 25650, put: 15, call: 22, pType: 'unwinding', cType: 'covering' },
    { k: 25600, put: 18, call: 85, pType: 'unwinding', cType: 'covering' },
    { k: 25550, put: 22, call: 30, pType: 'unwinding', cType: 'covering' },
    { k: 25500, put: 65, call: 210, pType: 'unwinding', cType: 'covering', isCeiling: true }, // Ceiling!
    { k: 25450, put: 14, call: 20, pType: 'unwinding', cType: 'covering' },
    { k: 25400, put: 28, call: 165, pType: 'unwinding', cType: 'covering' },
    { k: 25350, put: 12, call: 28, pType: 'unwinding', cType: 'covering' },
    { k: 25300, put: 32, call: 125, pType: 'unwinding', cType: 'covering' },
    { k: 25250, put: 18, call: 35, pType: 'unwinding', cType: 'covering' },
    { k: 25200, put: 40, call: 185, pType: 'unwinding', cType: 'covering' },
    { k: 25150, put: 25, call: 38, pType: 'unwinding', cType: 'covering' },
    { k: 25100, put: 50, call: 145, pType: 'unwinding', cType: 'covering' },
    { k: 25050, put: 30, call: 52, pType: 'unwinding', cType: 'covering' },
    { k: 25030, isSpot: true }, // Spot line
    { k: 25000, put: 175, call: 240, pType: 'unwinding', cType: 'covering' },
    { k: 24950, put: 22, call: 20, pType: 'unwinding', cType: 'covering' },
    { k: 24900, put: 65, call: 105, pType: 'unwinding', cType: 'covering' },
    { k: 24850, put: 18, call: 16, pType: 'unwinding', cType: 'covering' },
    { k: 24800, put: 135, call: 85, pType: 'unwinding', cType: 'covering' },
    { k: 24750, put: 28, call: 20, pType: 'unwinding', cType: 'covering' },
    { k: 24700, put: 88, call: 60, pType: 'unwinding', cType: 'covering' },
    { k: 24650, put: 35, call: 18, pType: 'unwinding', cType: 'covering' },
    { k: 24600, put: 125, call: 95, pType: 'unwinding', cType: 'covering' },
    { k: 24550, put: 42, call: 22, pType: 'unwinding', cType: 'covering' },
    { k: 24500, put: 245, call: 145, pType: 'unwinding', cType: 'covering', isFloor: true }, // Floor!
    { k: 24450, put: 38, call: 15, pType: 'unwinding', cType: 'covering' },
    { k: 24400, put: 150, call: 88, pType: 'unwinding', cType: 'covering' },
    { k: 24350, put: 18, call: 12, pType: 'unwinding', cType: 'covering' }
  ];

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Top Bar matching Image 5 */}
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

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors shadow-xs"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span>What am I looking at?</span>
        </button>
      </div>

      {showExplanation && (
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 text-xs text-muted-foreground leading-relaxed shadow-card">
          OI Flow tracks strike-by-strike changes in open contracts to pinpoint where option writers are actively building floors (put support) and ceilings (call resistance). The playback timeline shows intraday rotation in real-time or historical replay.
        </div>
      )}

      {/* 2. Main Row: Left Strike Ladder (Col 8) + Right Sidebar (Col 4) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Left: OI flow by strike (lg:col-span-8) */}
        <div className="lg:col-span-8 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            {/* Header with Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-hairline/60">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span>OI flow by strike</span>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                </div>

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
                    <span className="h-2 w-2 rounded-full bg-[#0284c7]" />
                    <span>Short covering</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#d97706]" />
                    <span>Long unwinding</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Last session · 06-Nov-2026 15:40</span>
                <Maximize2 className="h-3.5 w-3.5 hover:text-foreground cursor-pointer" />
              </div>
            </div>

            {/* Column Labels */}
            <div className="flex items-center justify-between px-6 pt-3 pb-2 text-xs font-semibold">
              <div className="text-amber-700 dark:text-amber-500 font-mono">
                ← PUT OI · writers = floor
              </div>
              <div className="text-sky-700 dark:text-sky-400 font-mono">
                CALL OI · writers = ceiling →
              </div>
            </div>

            {/* Bidirectional Strike Ladder */}
            <div className="relative py-2 overflow-x-auto select-none">
              <div className="min-w-[500px]">
                {strikes.map((s, idx) => {
                  if (s.isSpot) {
                    return (
                      <div key="spot" className="relative py-1 my-1 z-20">
                        <div className="h-[1.5px] border-b-2 border-dashed border-[#8b5cf6] w-full" />
                        <div className="absolute left-0 -top-2.5 bg-[#8b5cf6] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-xs">
                          Spot 25,030
                        </div>
                        <div className="absolute left-1/2 -top-1 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                      </div>
                    );
                  }

                  const putWidth = Math.min(95, Math.max(3, (s.put / 260) * 100));
                  const callWidth = Math.min(95, Math.max(3, (s.call / 260) * 100));

                  return (
                    <div
                      key={s.k}
                      className="relative flex items-center h-[18px] hover:bg-surface-2 transition-colors"
                    >
                      {/* Left: Put Bar (Amber / Unwinding) */}
                      <div className="flex-1 flex items-center justify-end h-full pr-2">
                        {/* Floor Badge at 24,500 */}
                        {s.isFloor && (
                          <div className="mr-2 inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Floor</span>
                          </div>
                        )}

                        <div
                          className="h-2 rounded-xs bg-[#b45309] dark:bg-amber-600/90"
                          style={{ width: `${putWidth}%` }}
                        />
                      </div>

                      {/* Center: Strike */}
                      <div className="w-14 text-center font-mono text-[10.5px] font-semibold text-foreground/80 shrink-0">
                        {s.k.toLocaleString()}
                      </div>

                      {/* Right: Call Bar (Blue / Covering) */}
                      <div className="flex-1 flex items-center justify-start h-full pl-2">
                        <div
                          className="h-2 rounded-xs bg-[#0284c7] dark:bg-sky-600/90"
                          style={{ width: `${callWidth}%` }}
                        />

                        {/* Ceiling Badge at 25,500 */}
                        {s.isCeiling && (
                          <div className="ml-2 inline-flex items-center gap-1 rounded bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 text-[9px] font-bold text-rose-600 dark:text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>Ceiling</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Playback Scrubber Controller matching Image 5 */}
            <div className="mt-4 pt-3 border-t border-hairline/60">
              <span className="text-[10px] text-muted-foreground font-mono">
                dots = OI added / removed · speed = OI/min
              </span>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Purple Play Button */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-colors shadow-sm"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
                  </button>

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <SkipBack className="h-4 w-4 cursor-pointer hover:text-foreground" />
                    <SkipForward className="h-4 w-4 cursor-pointer hover:text-foreground" />
                  </div>

                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-xl font-black text-foreground">12:43</span>
                    <span className="text-[11px] font-bold text-up">● Latest 1/1</span>
                  </div>
                </div>

                {/* Speed buttons */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-2 border border-hairline text-xs font-mono">
                  {speeds.map(sp => (
                    <button
                      key={sp}
                      onClick={() => setPlaySpeed(sp)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                        playSpeed === sp
                          ? 'bg-surface-card text-foreground font-bold shadow-xs border border-hairline'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                  <Info className="h-3 w-3 text-muted-foreground/60 ml-1" />
                </div>
              </div>

              {/* Scrubber Progress Track */}
              <div className="mt-3 relative py-2">
                <div className="h-6 w-full rounded-md bg-surface-2 border border-hairline/60 relative flex items-center px-1">
                  <div className="absolute right-2 h-4 w-2 rounded-xs bg-[#8b5cf6]" />
                </div>
              </div>
            </div>

            {/* 5 Footer Summary Stats */}
            <div className="mt-3 pt-3 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">SPOT</span>
                <span className="font-bold text-foreground text-sm">25,030</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">FUTURES</span>
                <span className="font-bold text-up text-sm">25,008.0 +420.0</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">PCR</span>
                <span className="font-bold text-foreground text-sm">0.49</span>
              </div>
              <div>
                <span className="text-[10px] text-down uppercase font-bold block">● CEILING</span>
                <span className="font-bold text-foreground text-sm">25,500</span>
              </div>
              <div>
                <span className="text-[10px] text-up uppercase font-bold block">● FLOOR</span>
                <span className="font-bold text-foreground text-sm">24,500</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-hairline/50 text-[10px] text-muted-foreground leading-relaxed">
            1 snapshot today · single snapshot: velocity = today's OI change ÷ minutes since open · expiry 17-Nov-2026 · Data shown is from publicly available sources. · Replay unlocks once a second snapshot is saved (about every 2 minutes in market hours).
          </div>
        </div>

        {/* Right Sidebar: 3 Cards (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Momentum & speed */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
                <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>Momentum &amp; speed</span>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">latest · 12:43</span>
              </div>

              {/* Semicircle Gauge */}
              <div className="py-4 flex flex-col items-center">
                <div className="relative w-48 h-24 flex items-end justify-center">
                  <svg viewBox="0 0 160 90" className="w-full h-full overflow-visible">
                    <path
                      d="M 20 80 A 60 60 0 0 1 70 23"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 72 22 A 60 60 0 0 1 88 22"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="8"
                    />
                    <path
                      d="M 90 23 A 60 60 0 0 1 140 80"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Indicator Dot at 0 */}
                    <circle cx="80" cy="22" r="5" fill="#0f172a" stroke="#ffffff" strokeWidth="2" className="dark:fill-slate-100 dark:stroke-slate-900" />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-6 text-center">
                    <span className="font-mono text-3xl font-black text-foreground">0</span>
                    <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                      FLOW MOMENTUM
                    </span>
                  </div>
                </div>

                <span className="text-[10px] text-muted-foreground font-mono mt-2">
                  -100 bearish · +100 bullish
                </span>
              </div>
            </div>

            {/* Bottom 2 metrics */}
            <div className="pt-3 border-t border-hairline/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">SPEED</span>
                <span className="font-mono font-bold text-foreground text-sm">0 contracts/min</span>
                <span className="text-[10px] text-muted-foreground block">near spot · steady</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">FUTURES</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">● Short covering</span>
                <span className="text-[10px] text-muted-foreground block">25,008.0 (+420.0) · OI 0</span>
              </div>
            </div>
          </div>

          {/* Card 2: What's next */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <Sparkles className="h-4 w-4 text-brand" />
                <span>What's next</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                Range-bound · 45% conviction
              </span>
            </div>

            <div className="py-3">
              <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            <div className="pt-2 border-t border-hairline/60 text-xs text-muted-foreground font-medium">
              Futures: short covering (price +420, OI +0.0)
            </div>
          </div>

          {/* Card 3: Hot strikes · fastest OI */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Hot strikes · fastest OI</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
            </div>

            <div className="py-2 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <strong className="text-foreground">24,350 CE</strong>
                  <span className="text-muted-foreground text-[11px]">Short covering</span>
                </div>
                <span className="font-bold text-foreground">0/min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <strong className="text-foreground">24,350 PE</strong>
                  <span className="text-muted-foreground text-[11px]">Long unwinding</span>
                </div>
                <span className="font-bold text-foreground">0/min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <strong className="text-foreground">24,400 CE</strong>
                  <span className="text-muted-foreground text-[11px]">Short covering</span>
                </div>
                <span className="font-bold text-foreground">0/min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
