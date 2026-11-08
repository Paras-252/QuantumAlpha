import React, { useState, useMemo } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Compass,
  Search,
  Info,
  Maximize2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  Activity
} from 'lucide-react';

export default function RadarView() {
  const { marketStatus, setActiveChartSymbol } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState('TCS');
  const [selectedTf, setSelectedTf] = useState('15m');

  const primarySymbols = ['RELIANCE', 'HDFCBANK', 'ICICIBANK', 'INFY', 'TCS', 'SBIN', 'ITC', 'NIFTY'];
  const timeframes = ['15m', '1h', '1d'];

  // Radar chart 8 axes calculations
  // Axes: OI (50), Options (38), VWAP (63), Vol profile (63), RSI (75), Price action (50), VIX/ATR calm (65), S/R room (63)
  const radarAxes = [
    { label: 'OI', val: 50, color: 'text-foreground' },
    { label: 'Options', val: 38, color: 'text-down' },
    { label: 'VWAP', val: 63, color: 'text-up' },
    { label: 'Vol profile', val: 63, color: 'text-up' },
    { label: 'RSI', val: 75, color: 'text-up' },
    { label: 'Price action', val: 50, color: 'text-foreground' },
    { label: 'VIX/ATR calm', val: 65, color: 'text-up' },
    { label: 'S/R room', val: 63, color: 'text-up' }
  ];

  // Coordinates for the 8-axis web
  const webSize = 240;
  const center = 120;
  const radius = 80;

  const getCoordinates = (index, value) => {
    const angle = (index * (360 / 8) - 90) * (Math.PI / 180);
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const getLabelCoordinates = (index) => {
    const angle = (index * (360 / 8) - 90) * (Math.PI / 180);
    const r = radius + 22;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const polygonPoints = radarAxes
    .map((axis, i) => {
      const pt = getCoordinates(i, axis.val);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Top Algorithmic Headline Banner matching Image 4 */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Neutral (+1.2/10) led by mixed signals; writers box 2,400-2,500; expected 2,394-2,583 by 23-Nov-2026 (64% conviction)
        </h1>
      </div>

      {/* 2. Symbol Navigation Bar matching Image 4 */}
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
      </div>

      {/* 3. Top 3 Metric Cards matching Image 4 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {/* Card 1: TCS spot */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">{selectedSymbol} spot</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-foreground tracking-tight">
              2,498.50
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline/60 pt-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-up/12 px-2 py-0.5 text-xs font-bold text-up">
              <ArrowUpRight className="h-3 w-3" />
              <span>+2.80 (+0.11%)</span>
            </span>
            <span className="text-[10.5px] font-mono text-muted-foreground">
              Chain 06-Nov 15:40 IST
            </span>
          </div>
        </div>

        {/* Card 2: Expected range */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Expected range</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-foreground tracking-tight">
              2,394 – 2,583
            </div>
          </div>
          <div className="mt-3 border-t border-hairline/60 pt-2.5 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground font-medium">expected by 23-Nov-2026</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-semibold">Conviction</span>
              <div className="w-20 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '64%' }} />
              </div>
              <span className="font-mono text-xs font-bold text-foreground">64%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Typical daily move (ATR) */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Typical daily move (ATR)</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-foreground tracking-tight">
              ±71.5
            </div>
          </div>
          <div className="mt-3 border-t border-hairline/60 pt-2.5 text-xs text-muted-foreground font-medium">
            2.86% of spot per day
          </div>
        </div>
      </div>

      {/* 4. Middle Row: Signal Radar (Left) + Score & Expected Range (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Left: Signal radar (lg:col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <Compass className="h-4 w-4 text-muted-foreground" />
                <span>Signal radar</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-hairline">
                  neutral
                </span>
                <Maximize2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
              </div>
            </div>

            {/* Spider / Radar SVG Chart */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 select-none">
                <svg viewBox={`0 0 ${webSize} ${webSize}`} className="w-full h-full overflow-visible">
                  {/* Concentric Octagonal Grid Rings: 25, 50, 75, 100 */}
                  {[25, 50, 75, 100].map(level => {
                    const pts = [0, 1, 2, 3, 4, 5, 6, 7]
                      .map(i => {
                        const pt = getCoordinates(i, level);
                        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                      })
                      .join(' ');
                    return (
                      <polygon
                        key={level}
                        points={pts}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={level === 50 ? 0.25 : 0.08}
                        strokeWidth={level === 50 ? 1.5 : 1}
                        strokeDasharray={level === 50 ? '3 3' : 'none'}
                      />
                    );
                  })}

                  {/* 8 Radial Spokes */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                    const outer = getCoordinates(i, 100);
                    return (
                      <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={outer.x}
                        y2={outer.y}
                        stroke="currentColor"
                        strokeOpacity="0.12"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Filled Green Radar Polygon */}
                  <polygon
                    points={polygonPoints}
                    fill="#16a34a"
                    fillOpacity="0.20"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />

                  {/* Vertices Dots */}
                  {radarAxes.map((axis, i) => {
                    const pt = getCoordinates(i, axis.val);
                    return (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#16a34a"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Outer Axis Labels & Scores */}
                  {radarAxes.map((axis, i) => {
                    const pt = getLabelCoordinates(i);
                    return (
                      <g key={i}>
                        <text
                          x={pt.x}
                          y={pt.y - 2}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[9.5px] font-sans font-medium"
                        >
                          {axis.label}
                        </text>
                        <text
                          x={pt.x}
                          y={pt.y + 9}
                          textAnchor="middle"
                          className={`font-mono text-[9px] font-bold ${
                            axis.val > 55 ? 'fill-emerald-600 dark:fill-emerald-400' : axis.val < 45 ? 'fill-rose-600 dark:fill-rose-400' : 'fill-foreground'
                          }`}
                        >
                          {axis.val}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-hairline/60 text-[11px] text-muted-foreground leading-relaxed">
            Hover or tap an axis to see what drives it. 50 is neutral; further out is more supportive for longs (or calmer / more room).
          </div>
        </div>

        {/* Right: Score & expected range (lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>Score &amp; expected range</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
            </div>

            {/* Expected Range Horizontal Track matching Image 4 */}
            <div className="pt-3 pb-4">
              <div className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                EXPECTED RANGE BY 23-NOV-2026
              </div>

              <div className="pt-6 pb-2 px-8 max-w-md mx-auto">
                <div className="h-1 bg-surface-muted rounded-full relative">
                  <span className="absolute left-0 -top-2 h-5 w-0.5 bg-down" />
                  <span className="absolute left-0 top-2.5 text-[10px] font-mono font-medium text-muted-foreground">
                    2,394
                  </span>

                  <span className="absolute right-0 -top-2 h-5 w-0.5 bg-down" />
                  <span className="absolute right-0 top-2.5 text-[10px] font-mono font-medium text-muted-foreground">
                    2,583
                  </span>

                  {/* Active segment */}
                  <div className="absolute left-[15%] right-[20%] top-[-2px] bottom-[-2px] bg-brand/80 rounded-full" />

                  {/* Spot Pill */}
                  <div className="absolute left-[54%] -top-3.5 -translate-x-1/2 bg-foreground text-background px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shadow-xs">
                    2,499
                  </div>
                </div>
              </div>
            </div>

            {/* Speedometer Arc Gauge: +1.3 NEUTRAL */}
            <div className="py-2 flex flex-col items-center">
              <div className="relative w-56 h-28 flex items-end justify-center">
                <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
                  {/* Left Red Arc */}
                  <path
                    d="M 25 105 A 75 75 0 0 1 85 33"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Middle Gray Arc */}
                  <path
                    d="M 87 32 A 75 75 0 0 1 113 32"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="10"
                  />
                  {/* Right Green Arc */}
                  <path
                    d="M 115 33 A 75 75 0 0 1 175 105"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Indicator Dot at +1.3 (slightly right of center) */}
                  <circle
                    cx="108"
                    cy="31"
                    r="7"
                    fill="#0f172a"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="dark:fill-slate-100 dark:stroke-slate-900"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 text-center">
                  <span className="font-mono text-3xl font-black text-foreground">+1.3</span>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    NEUTRAL
                  </span>
                </div>

                <div className="absolute inset-x-0 -bottom-3 flex justify-between text-[10px] text-muted-foreground font-semibold px-2">
                  <span>Bearish</span>
                  <span>Bullish</span>
                </div>
              </div>

              <span className="text-[11px] text-muted-foreground mt-3 font-medium">
                Composite of 6 signals, scaled -10 to +10
              </span>
            </div>

            {/* 6 Factor Breakdown Bars matching Image 4 */}
            <div className="mt-4 pt-3 border-t border-hairline/60 space-y-3 text-xs">
              {/* Factor 1: Futures OI buildup */}
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Futures OI buildup</span>
                  <span className="font-mono font-bold text-foreground">0.0</span>
                </div>
                <div className="h-1 w-full bg-surface-muted rounded-full relative my-1">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-muted-foreground" />
                </div>
                <span className="text-[10.5px] text-muted-foreground">OI flat (+0.0%) - no conviction</span>
              </div>

              {/* Factor 2: Option chain */}
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Option chain</span>
                  <span className="font-mono font-bold text-down">-0.5</span>
                </div>
                <div className="h-1 w-full bg-surface-muted rounded-full relative my-1">
                  <div className="absolute right-1/2 top-0 bottom-0 bg-down rounded-l-full" style={{ width: '25%' }} />
                </div>
                <span className="text-[10.5px] text-muted-foreground">PCR 0.82 neutral; price just under biggest call wall</span>
              </div>

              {/* Factor 3: Volume profile */}
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Volume profile</span>
                  <span className="font-mono font-bold text-up">+0.5</span>
                </div>
                <div className="h-1 w-full bg-surface-muted rounded-full relative my-1">
                  <div className="absolute left-1/2 top-0 bottom-0 bg-up rounded-r-full" style={{ width: '25%' }} />
                </div>
                <span className="text-[10.5px] text-muted-foreground">inside value, above POC</span>
              </div>

              {/* Factor 4: RSI divergence */}
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">RSI divergence</span>
                  <span className="font-mono font-bold text-up">+1.0</span>
                </div>
                <div className="h-1 w-full bg-surface-muted rounded-full relative my-1">
                  <div className="absolute left-1/2 top-0 bottom-0 bg-up rounded-r-full" style={{ width: '50%' }} />
                </div>
                <span className="text-[10.5px] text-muted-foreground">1d hidden bullish (04-Nov 00:00)</span>
              </div>

              {/* Factor 5: Price action */}
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Price action</span>
                  <span className="font-mono font-bold text-foreground">0.0</span>
                </div>
                <div className="h-1 w-full bg-surface-muted rounded-full relative my-1">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-muted-foreground" />
                </div>
                <span className="text-[10.5px] text-muted-foreground">1h range/transition HH/LL; daily range/transition LH/HL</span>
              </div>

              {/* Factor 6: VWAP */}
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">VWAP</span>
                  <span className="font-mono font-bold text-up">+0.5</span>
                </div>
                <div className="h-1 w-full bg-surface-muted rounded-full relative my-1">
                  <div className="absolute left-1/2 top-0 bottom-0 bg-up rounded-r-full" style={{ width: '25%' }} />
                </div>
                <span className="text-[10.5px] text-muted-foreground">between session and weekly VWAP; above anchored VWAP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Card: Price · key levels only matching Image 4 */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-hairline/60">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>Price · key levels only</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-up" />
                <span>support</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-down" />
                <span>resistance</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-700" />
                <span>POC</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span>VWAP</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-2 border border-hairline text-xs">
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
        </div>

        <div className="pt-2 text-xs font-mono text-muted-foreground">
          Last 2,498.5 · VWAP 2,505.0
        </div>

        {/* Multi-line chart canvas */}
        <div className="relative py-4 w-full h-[220px] select-none">
          <svg viewBox="0 0 1000 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Horizontal Key Levels lines */}
            {/* R2 2600.00 */}
            <line x1="20" y1="20" x2="920" y2="20" stroke="#ef4444" strokeOpacity="0.5" strokeWidth="1" />
            <text x="930" y="23" className="fill-rose-500 font-mono text-[9px]">R2 2600.00</text>

            {/* R1 2555.15 */}
            <line x1="20" y1="45" x2="920" y2="45" stroke="#ef4444" strokeOpacity="0.5" strokeWidth="1" />
            <text x="930" y="48" className="fill-rose-500 font-mono text-[9px]">R1 2555.15</text>

            {/* 2522.62 */}
            <line x1="20" y1="65" x2="920" y2="65" stroke="#ef4444" strokeOpacity="0.3" strokeDasharray="3 3" />
            <text x="930" y="68" className="fill-rose-500 font-mono text-[9px]">2522.62</text>

            {/* Spot badge 2498.50 */}
            <line x1="20" y1="85" x2="920" y2="85" stroke="#16a34a" strokeOpacity="0.8" strokeWidth="1.2" />
            <rect x="926" y="75" width="56" height="18" fill="#16a34a" rx="3" />
            <text x="954" y="87" textAnchor="middle" className="fill-white font-mono text-[10px] font-bold">2498.50</text>

            {/* POC 2496.65 */}
            <line x1="20" y1="98" x2="920" y2="98" stroke="#b45309" strokeOpacity="0.6" strokeWidth="1" />
            <text x="930" y="101" className="fill-amber-600 font-mono text-[9px]">POC 2496.65</text>

            {/* S1 2484.09 */}
            <line x1="20" y1="120" x2="920" y2="120" stroke="#16a34a" strokeOpacity="0.5" strokeWidth="1" />
            <text x="930" y="123" className="fill-emerald-600 font-mono text-[9px]">S1 2484.09</text>

            {/* S2 2464.11 */}
            <line x1="20" y1="145" x2="920" y2="145" stroke="#16a34a" strokeOpacity="0.5" strokeWidth="1" />
            <text x="930" y="148" className="fill-emerald-600 font-mono text-[9px]">S2 2464.11</text>

            {/* 2300.00 */}
            <text x="930" y="195" className="fill-muted-foreground font-mono text-[9px]">2300.00</text>

            {/* VWAP line (Blue) */}
            <path
              d="M 20 180 Q 200 170 350 140 T 520 100 T 700 80 T 880 78 L 920 80"
              fill="none"
              stroke="#2563eb"
              strokeWidth="1.8"
            />

            {/* Price line (Green) */}
            <path
              d="M 20 185 L 80 180 L 140 182 L 200 178 L 260 175 L 320 145 L 380 135 L 440 142 L 500 105 L 560 98 L 620 120 L 680 95 L 740 68 L 800 88 L 860 75 L 900 85 L 920 85"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
