import React, { useMemo, useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import PulseFlowView from '../components/pulse/PulseFlowView';
import PulseOrderflowView from '../components/pulse/PulseOrderflowView';
import AutoTradeModal from '../components/signals/AutoTradeModal';
import { INITIAL_SIGNALS } from '../data/signalsData';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Maximize2,
  Info,
  Clock,
  Sparkles,
  ArrowUpRight,
  Zap
} from 'lucide-react';

export default function PulseView() {
  const {
    indices,
    vix,
    mood,
    sectors,
    marketStatus,
    marketSubtext,
    pulseView,
    changePulseView,
    setCurrentScreen,
    setActiveChartSymbol
  } = useMarketData();

  const [topSignalModal, setTopSignalModal] = useState(false);
  const topSignal = INITIAL_SIGNALS[0];

  // NIFTY and BANKNIFTY indexes
  const nifty = indices.find(i => i.symbol === 'NIFTY') || {
    symbol: 'NIFTY',
    ltp: 25030.35,
    change: 493.8,
    pChange: 2.01,
    sparkline: [24550, 24600, 24580, 24700, 24750, 24820, 24800, 24890, 24920, 24980, 25010, 25030.35],
    range: [24626, 25411]
  };

  const banknifty = indices.find(i => i.symbol === 'BANKNIFTY') || {
    symbol: 'BANKNIFTY',
    ltp: 59086.00,
    change: 1312.4,
    pChange: 2.27,
    sparkline: [57800, 58000, 57900, 58200, 58400, 58650, 58500, 58800, 58950, 59020, 59086],
    range: [57583, 60539]
  };

  // Leaders & Laggards
  const sortedSectors = [...sectors].sort((a, b) => b.p - a.p);
  const leaders = sortedSectors.slice(0, 2);
  const laggards = sortedSectors.slice(-2).reverse();

  // Money rotation particle canvas / visual data
  const leavingSectors = [
    { name: 'Cap goods', val: '-₹1,803 cr', flow: -1803 },
    { name: 'IT', val: '-₹1,467 cr', flow: -1467 },
    { name: 'Defence', val: '-₹2... cr', flow: -250 },
    { name: 'Others', val: '-₹1... cr', flow: -180 }
  ];

  const arrivingSectors = [
    { name: 'Bank', val: '+₹15,451 cr', flow: 15451 },
    { name: 'Pharma', val: '+₹4,907 cr', flow: 4907 },
    { name: 'Consumer', val: '+₹4,005 cr', flow: 4005 },
    { name: 'Auto', val: '+₹3,605 cr', flow: 3605 }
  ];

  // Helper for mini SVG area charts
  const renderAreaChart = (sparkline, isPositive = true) => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const w = 320;
    const h = 75;
    const pts = sparkline.map((val, i) => {
      const x = (i / (sparkline.length - 1)) * w;
      const y = h - ((val - min) / range) * (h - 12) - 6;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const linePath = `M ${pts.join(' L ')}`;
    const areaPath = `M ${pts[0]} L ${pts.join(' L ')} L ${w},${h} L 0,${h} Z`;
    const strokeColor = isPositive ? '#16a34a' : '#dc2626';
    const fillColor = isPositive ? '#22c55e' : '#ef4444';

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-18 overflow-visible">
        <defs>
          <linearGradient id={`grad-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.32" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${isPositive ? 'up' : 'down'})`} />
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* End dot */}
        <circle
          cx={w}
          cy={h - ((sparkline[sparkline.length - 1] - min) / range) * (h - 12) - 6}
          r="3"
          fill={strokeColor}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Top Subview Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-hairline shadow-sm">
          <button
            onClick={() => changePulseView('overview')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              pulseView === 'overview'
                ? 'bg-surface-2 text-foreground shadow-xs border border-hairline/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => changePulseView('flow')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              pulseView === 'flow'
                ? 'bg-surface-2 text-foreground shadow-xs border border-hairline/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Money flow</span>
          </button>

          <button
            onClick={() => changePulseView('orderflow')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              pulseView === 'orderflow'
                ? 'bg-surface-2 text-foreground shadow-xs border border-hairline/80 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Order flow</span>
          </button>
        </div>

        {/* Market Status Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-hairline/80 bg-surface-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
          <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
          <span>Market closed · showing last session's close</span>
        </div>
      </div>

      {/* Institutional Top Signal Strip */}
      {topSignal && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/40 bg-brand/5 p-3 sm:px-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
            <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-0.5 text-[11px] font-black text-white uppercase tracking-wider">
              <Zap className="h-3 w-3 fill-white" />
              <span>{topSignal.priorityGrade} Auto Signal</span>
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {topSignal.action} {topSignal.symbol} @ ₹{topSignal.entry.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-xs font-mono">·</span>
            <span className="text-xs font-mono text-rose-500 font-bold">
              SL: ₹{topSignal.sl}
            </span>
            <span className="text-muted-foreground text-xs font-mono">·</span>
            <span className="text-xs font-mono text-emerald-500 font-bold">
              T1: ₹{topSignal.target1} ({topSignal.rrRatio})
            </span>
            <span className="text-xs text-muted-foreground font-semibold max-md:hidden">
              · {topSignal.conviction}% Conviction ({topSignal.strategyName})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTopSignalModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand/90 px-3 py-1 text-xs font-bold text-white transition-colors shadow-xs"
            >
              <span>1-Click Trade</span>
            </button>
            <button
              onClick={() => setCurrentScreen('signals')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              <span>All 6 Signals</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Render Subviews or Overview */}
      {pulseView === 'flow' ? (
        <PulseFlowView />
      ) : pulseView === 'orderflow' ? (
        <PulseOrderflowView />
      ) : (
        <>
          {/* 2. Top Card: Money rotation ribbon */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-hairline/50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>Money rotation</span>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-down" />
                    <span>Leaving</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-brand" />
                    <span>Net flow</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-up" />
                    <span>Arriving</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last session</span>
                </span>
                <button
                  onClick={() => changePulseView('flow')}
                  className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                >
                  <span>Money flow</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Particle Stream Channel */}
            <div className="py-4 sm:py-5 overflow-hidden">
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Left: Leaving Sector Labels */}
                <div className="w-full md:w-36 space-y-1.5 shrink-0 text-left font-mono text-xs">
                  {leavingSectors.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-down shrink-0" />
                      <span className="font-semibold text-foreground/90">{s.name}</span>
                      <span className="text-down font-bold text-[11px] ml-auto">{s.val}</span>
                    </div>
                  ))}
                </div>

                {/* Center: Particle Stream Graphic Canvas */}
                <div className="flex-1 w-full relative h-16 sm:h-20 flex items-center justify-center">
                  <svg viewBox="0 0 700 80" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="streamGradLeft" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.10" />
                      </linearGradient>
                      <linearGradient id="streamGradRight" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.22" />
                      </linearGradient>
                    </defs>

                    {/* Funnel Channels */}
                    <path d="M 0 10 Q 180 25 350 30 L 350 50 Q 180 55 0 70 Z" fill="url(#streamGradLeft)" />
                    <path d="M 350 30 Q 520 25 700 8 L 700 72 Q 520 55 350 50 Z" fill="url(#streamGradRight)" />

                    {/* Center Net Flow Divider Bar */}
                    <line x1="350" y1="5" x2="350" y2="75" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />

                    {/* Red Leaving Particle Dots */}
                    {[
                      { cx: 30, cy: 22, r: 2.2 }, { cx: 70, cy: 35, r: 2.5 }, { cx: 95, cy: 18, r: 1.8 },
                      { cx: 120, cy: 45, r: 2.3 }, { cx: 150, cy: 30, r: 2.0 }, { cx: 185, cy: 38, r: 2.4 },
                      { cx: 210, cy: 26, r: 1.9 }, { cx: 240, cy: 42, r: 2.2 }, { cx: 270, cy: 34, r: 2.5 },
                      { cx: 295, cy: 39, r: 2.0 }, { cx: 320, cy: 36, r: 2.4 }, { cx: 50, cy: 55, r: 2.1 },
                      { cx: 135, cy: 58, r: 1.9 }, { cx: 225, cy: 52, r: 2.2 }
                    ].map((dot, i) => (
                      <circle key={`l-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#dc2626" opacity="0.85" />
                    ))}

                    {/* Green Arriving Particle Dots */}
                    {[
                      { cx: 375, cy: 36, r: 2.0 }, { cx: 400, cy: 32, r: 2.3 }, { cx: 430, cy: 45, r: 2.5 },
                      { cx: 460, cy: 25, r: 2.2 }, { cx: 485, cy: 40, r: 2.1 }, { cx: 510, cy: 30, r: 2.6 },
                      { cx: 540, cy: 48, r: 2.0 }, { cx: 565, cy: 22, r: 2.4 }, { cx: 590, cy: 42, r: 2.2 },
                      { cx: 620, cy: 28, r: 2.5 }, { cx: 645, cy: 50, r: 1.9 }, { cx: 670, cy: 35, r: 2.3 },
                      { cx: 415, cy: 52, r: 2.1 }, { cx: 495, cy: 18, r: 2.0 }, { cx: 580, cy: 56, r: 2.2 },
                      { cx: 635, cy: 16, r: 2.4 }, { cx: 680, cy: 60, r: 2.0 }
                    ].map((dot, i) => (
                      <circle key={`r-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#16a34a" opacity="0.9" />
                    ))}
                  </svg>

                  {/* Net badge label sitting on top of the divider */}
                  <div className="absolute top-0 text-[10px] font-mono font-bold text-foreground bg-surface-card border border-hairline px-2 py-0.5 rounded shadow-xs">
                    Net +₹48,330 cr
                  </div>
                </div>

                {/* Right: Arriving Sector Labels */}
                <div className="w-full md:w-36 space-y-1.5 shrink-0 text-left font-mono text-xs">
                  {arrivingSectors.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-up shrink-0" />
                      <span className="font-semibold text-foreground/90">{s.name}</span>
                      <span className="text-up font-bold text-[11px] ml-auto">{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Subtitle */}
            <div className="pt-2 text-xs text-muted-foreground font-medium">
              Money rotating into Bank &amp; Pharma; Cap goods &amp; IT seeing outflows; breadth 229:267 mixed; net flow +₹48,330 cr
            </div>
          </div>

          {/* 3. Middle Row: 3 Equal Cards */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Card 1: Market mood */}
            <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
                  <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Market mood</span>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last session</span>
                    <Maximize2 className="h-3.5 w-3.5 cursor-pointer hover:text-foreground" />
                  </div>
                </div>

                {/* Body: Gauge on left, Factor bars on right */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  {/* Semicircle Speedometer */}
                  <div className="relative w-36 h-24 flex items-end justify-center shrink-0">
                    <svg viewBox="0 0 160 100" className="w-full h-full overflow-visible">
                      {/* Arc Track */}
                      <path
                        d="M 20 85 A 60 60 0 0 1 140 85"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="dark:stroke-slate-800"
                      />
                      {/* Colored Segments */}
                      <path
                        d="M 20 85 A 60 60 0 0 1 50 42"
                        fill="none"
                        stroke="#f87171"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 52 40 A 60 60 0 0 1 108 40"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="10"
                      />
                      <path
                        d="M 110 42 A 60 60 0 0 1 140 85"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />

                      {/* Needle Indicator pointing at ~58/100 */}
                      <line
                        x1="80"
                        y1="85"
                        x2="90"
                        y2="38"
                        stroke="#0f172a"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="dark:stroke-slate-100"
                      />
                      <circle cx="80" cy="85" r="4.5" fill="#0f172a" className="dark:fill-slate-100" />
                    </svg>

                    {/* Center Readout */}
                    <div className="absolute inset-x-0 bottom-0 text-center">
                      <span className="font-mono text-2xl font-black text-foreground">58</span>
                      <span className="text-[11px] font-semibold text-muted-foreground">/100</span>
                    </div>

                    <div className="absolute inset-x-0 -bottom-4 flex justify-between text-[9px] text-muted-foreground font-semibold px-1">
                      <span>Risk-off</span>
                      <span>Risk-on</span>
                    </div>
                  </div>

                  {/* Factor Breakdown Bars on Right */}
                  <div className="flex-1 w-full space-y-2 text-xs">
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Constructive
                    </h3>

                    {/* Factor 1: Breadth 35% (-0.08) */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground w-24 shrink-0">Breadth 35%</span>
                      <div className="flex-1 h-1.5 bg-surface-muted rounded-full relative overflow-hidden flex items-center">
                        <div className="w-1/2 h-full flex justify-end">
                          <div className="h-full bg-down rounded-l-full" style={{ width: '16%' }} />
                        </div>
                        <div className="w-1/2 h-full" />
                      </div>
                      <span className="font-mono text-down font-bold w-10 text-right">-0.08</span>
                    </div>

                    {/* Factor 2: Money flow 30% (+0.83) */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground w-24 shrink-0">Money flow 30%</span>
                      <div className="flex-1 h-1.5 bg-surface-muted rounded-full relative overflow-hidden flex items-center">
                        <div className="w-1/2 h-full" />
                        <div className="w-1/2 h-full flex justify-start">
                          <div className="h-full bg-up rounded-r-full" style={{ width: '83%' }} />
                        </div>
                      </div>
                      <span className="font-mono text-up font-bold w-10 text-right">+0.83</span>
                    </div>

                    {/* Factor 3: NIFTY signal 20% (+0.31) */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground w-24 shrink-0">NIFTY signal 20%</span>
                      <div className="flex-1 h-1.5 bg-surface-muted rounded-full relative overflow-hidden flex items-center">
                        <div className="w-1/2 h-full" />
                        <div className="w-1/2 h-full flex justify-start">
                          <div className="h-full bg-up rounded-r-full" style={{ width: '31%' }} />
                        </div>
                      </div>
                      <span className="font-mono text-up font-bold w-10 text-right">+0.31</span>
                    </div>

                    {/* Factor 4: Volatility 15% (-0.40) */}
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground w-24 shrink-0">Volatility 15%</span>
                      <div className="flex-1 h-1.5 bg-surface-muted rounded-full relative overflow-hidden flex items-center">
                        <div className="w-1/2 h-full flex justify-end">
                          <div className="h-full bg-down rounded-l-full" style={{ width: '40%' }} />
                        </div>
                        <div className="w-1/2 h-full" />
                      </div>
                      <span className="font-mono text-down font-bold w-10 text-right">-0.40</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom subtext */}
              <div className="pt-3 mt-4 border-t border-hairline/60 text-xs font-semibold text-foreground">
                Breadth 229:267 · net flow +₹48,330 cr
              </div>
            </div>

            {/* Card 2: NIFTY */}
            <div
              onClick={() => setActiveChartSymbol({ symbol: 'NIFTY', ltp: nifty.ltp })}
              className="cursor-pointer group rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card hover:border-brand/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
                  <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>NIFTY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-up/12 px-2.5 py-0.5 text-xs font-bold text-up">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>Bullish</span>
                    </span>
                    <Maximize2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </div>
                </div>

                {/* Spot Price */}
                <div className="flex items-baseline gap-2 pt-3">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
                    25,030.35
                  </span>
                  <span className="font-mono text-xs font-bold text-up">
                    +493.8 (+2.01%)
                  </span>
                </div>

                {/* Area Chart */}
                <div className="py-2">
                  {renderAreaChart(nifty.sparkline, true)}
                </div>

                {/* Expected Range Bracket Bar */}
                <div className="mt-1 space-y-1">
                  <div className="relative pt-4 pb-2 px-6">
                    <div className="h-1 bg-surface-muted rounded-full relative">
                      {/* Left bracket tick */}
                      <span className="absolute left-0 -top-2.5 h-6 w-0.5 bg-down" />
                      <span className="absolute left-0 top-3 text-[10px] font-mono font-medium text-muted-foreground">
                        24,626
                      </span>

                      {/* Right bracket tick */}
                      <span className="absolute right-0 -top-2.5 h-6 w-0.5 bg-down" />
                      <span className="absolute right-0 top-3 text-[10px] font-mono font-medium text-muted-foreground">
                        25,411
                      </span>

                      {/* Center active segment */}
                      <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-brand/50 rounded-full" />

                      {/* Current spot pill */}
                      <div className="absolute left-[52%] -top-3.5 -translate-x-1/2 bg-foreground text-background px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shadow-xs">
                        25,030
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom subtext */}
              <div className="pt-3 mt-4 border-t border-hairline/60 text-xs font-medium text-muted-foreground">
                Expected 24,626 – 25,411 by 09-Nov-2026
              </div>
            </div>

            {/* Card 3: BANKNIFTY */}
            <div
              onClick={() => setActiveChartSymbol({ symbol: 'BANKNIFTY', ltp: banknifty.ltp })}
              className="cursor-pointer group rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card hover:border-brand/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
                  <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>BANKNIFTY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-up/12 px-2.5 py-0.5 text-xs font-bold text-up">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>Bullish</span>
                    </span>
                    <Maximize2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </div>
                </div>

                {/* Spot Price */}
                <div className="flex items-baseline gap-2 pt-3">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-foreground">
                    59,086.00
                  </span>
                  <span className="font-mono text-xs font-bold text-up">
                    +1,312.4 (+2.27%)
                  </span>
                </div>

                {/* Area Chart */}
                <div className="py-2">
                  {renderAreaChart(banknifty.sparkline, true)}
                </div>

                {/* Expected Range Bracket Bar */}
                <div className="mt-1 space-y-1">
                  <div className="relative pt-4 pb-2 px-6">
                    <div className="h-1 bg-surface-muted rounded-full relative">
                      {/* Left bracket tick */}
                      <span className="absolute left-0 -top-2.5 h-6 w-0.5 bg-down" />
                      <span className="absolute left-0 top-3 text-[10px] font-mono font-medium text-muted-foreground">
                        57,583
                      </span>

                      {/* Right bracket tick */}
                      <span className="absolute right-0 -top-2.5 h-6 w-0.5 bg-down" />
                      <span className="absolute right-0 top-3 text-[10px] font-mono font-medium text-muted-foreground">
                        60,539
                      </span>

                      {/* Center active segment */}
                      <div className="absolute left-[15%] right-[20%] top-0 bottom-0 bg-brand/50 rounded-full" />

                      {/* Current spot pill */}
                      <div className="absolute left-[55%] -top-3.5 -translate-x-1/2 bg-foreground text-background px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shadow-xs">
                        59,086
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom subtext */}
              <div className="pt-3 mt-4 border-t border-hairline/60 text-xs font-medium text-muted-foreground">
                Expected 57,583 – 60,539 by 23-Nov-2026
              </div>
            </div>
          </div>

          {/* 4. Bottom Row: Sector Map (Col 8) + India VIX (Col 4) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Sector Treemap (lg:col-span-8) */}
            <div className="lg:col-span-8 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-hairline/60">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <span>Sector map</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Size = turnover</span>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                      <div className="h-2 w-12 rounded-full bg-gradient-to-r from-red-500 via-amber-200 to-emerald-600" />
                      <span>-4% ... +4%</span>
                    </div>
                  </div>
                  <Maximize2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>

                {/* Treemap Mosaic Matching Image 1 */}
                <div className="pt-3.5 grid grid-cols-12 gap-2 text-xs select-none">
                  {/* Bank +3.7% (col-span-3) */}
                  <div className="col-span-12 sm:col-span-4 lg:col-span-3 bg-emerald-600/90 text-white p-2.5 rounded-xl flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div>
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>Bank</span>
                        <span>+3.7%</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="bg-emerald-700/80 p-1.5 rounded text-[10px]">
                          <span className="font-bold">ICICIBANK</span>
                          <span className="float-right font-mono">+4.8%</span>
                        </div>
                        <div className="bg-emerald-700/80 p-1.5 rounded text-[10px]">
                          <span className="font-bold">HDFCBANK</span>
                          <span className="float-right font-mono">+3.7%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NBFC -1.2% (col-span-2) */}
                  <div className="col-span-6 sm:col-span-4 lg:col-span-2 bg-rose-600 text-white p-2.5 rounded-xl flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div>
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>NBFC</span>
                        <span>-1.2%</span>
                      </div>
                      <div className="mt-2 bg-rose-700 p-1.5 rounded text-[10px]">
                        <span className="font-bold">GROWW</span>
                        <span className="float-right font-mono">-3.7%</span>
                      </div>
                    </div>
                  </div>

                  {/* Pharma +3.6% (col-span-2) */}
                  <div className="col-span-6 sm:col-span-4 lg:col-span-2 bg-emerald-600/95 text-white p-2.5 rounded-xl flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div>
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>Pharma</span>
                        <span>+3.6%</span>
                      </div>
                      <div className="mt-2 bg-emerald-700/80 p-1.5 rounded text-[10px]">
                        <span className="font-bold">SUNLIFE</span>
                        <span className="float-right font-mono">+10.9%</span>
                      </div>
                    </div>
                  </div>

                  {/* Consumer +2.2% (col-span-2) */}
                  <div className="col-span-6 sm:col-span-4 lg:col-span-2 bg-emerald-500/85 text-white p-2.5 rounded-xl flex flex-col justify-between min-h-[140px] shadow-xs">
                    <div>
                      <div className="flex justify-between font-bold text-[11px]">
                        <span>Consumer</span>
                        <span>+2.2%</span>
                      </div>
                      <div className="mt-2 space-y-1 text-[10px]">
                        <div className="bg-emerald-600/80 p-1 rounded">
                          <span className="font-bold">TITAN</span>
                          <span className="float-right font-mono">+3.4%</span>
                        </div>
                        <div className="bg-emerald-600/80 p-1 rounded">
                          <span className="font-bold">KALYANKJIL</span>
                          <span className="float-right font-mono">+6.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metal, FMCG, Power mini blocks (col-span-3) */}
                  <div className="col-span-6 sm:col-span-4 lg:col-span-3 grid grid-cols-2 gap-1.5">
                    <div className="bg-emerald-500/60 text-white p-2 rounded-lg text-[10px]">
                      <span className="font-bold">Metal</span>
                      <span className="float-right font-mono">+0.9%</span>
                    </div>
                    <div className="bg-emerald-500/50 text-white p-2 rounded-lg text-[10px]">
                      <span className="font-bold">FMCG</span>
                      <span className="float-right font-mono">+0.2%</span>
                    </div>
                    <div className="bg-emerald-500/50 text-white p-2 rounded-lg text-[10px]">
                      <span className="font-bold">Power</span>
                      <span className="float-right font-mono">+0.1%</span>
                    </div>
                    <div className="bg-emerald-600/80 text-white p-2 rounded-lg text-[10px]">
                      <span className="font-bold">MCX</span>
                      <span className="float-right font-mono">+4.8%</span>
                    </div>
                  </div>

                  {/* Row 2: Cap goods, Auto, IT, Telecom */}
                  <div className="col-span-12 sm:col-span-4 lg:col-span-3 bg-rose-500/85 text-white p-2.5 rounded-xl min-h-[90px] shadow-xs">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>Cap goods</span>
                      <span>-4.2%</span>
                    </div>
                    <div className="mt-2 flex gap-1 text-[10px]">
                      <div className="flex-1 bg-rose-600/90 p-1.5 rounded">
                        <span className="font-bold block">CGPOWER</span>
                        <span className="font-mono text-[9px]">-4.4%</span>
                      </div>
                      <div className="w-12 bg-rose-600/70 p-1.5 rounded text-center">
                        <span className="font-bold">ABB</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-4 lg:col-span-2 bg-emerald-500/80 text-white p-2.5 rounded-xl min-h-[90px] shadow-xs">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>Auto</span>
                      <span>+0.7%</span>
                    </div>
                    <div className="mt-2 bg-emerald-600/90 p-1.5 rounded text-[10px]">
                      <span className="font-bold">M&amp;M</span>
                      <span className="float-right font-mono">+5.1%</span>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-4 lg:col-span-2 bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-white p-2.5 rounded-xl min-h-[90px] shadow-xs">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>IT</span>
                      <span>-0.4%</span>
                    </div>
                    <div className="mt-1 space-y-1 text-[9.5px]">
                      <div className="font-mono">INFY -1.2%</div>
                      <div className="font-mono">TCS +0.5%</div>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-emerald-500/75 text-white p-2.5 rounded-xl min-h-[90px] shadow-xs">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>Telecom</span>
                      <span>+3.3%</span>
                    </div>
                    <div className="mt-2 bg-emerald-600/90 p-1.5 rounded text-[10px]">
                      <span className="font-bold">BHARTIARTL</span>
                      <span className="float-right font-mono">+2.5%</span>
                    </div>
                  </div>

                  <div className="col-span-12 sm:col-span-6 lg:col-span-2 bg-emerald-500/70 text-white p-2.5 rounded-xl min-h-[90px] shadow-xs">
                    <div className="font-bold text-[11px]">PSU Bank +0.8%</div>
                    <div className="mt-1 text-[10px] font-mono">SBIN +1.2%</div>
                  </div>
                </div>
              </div>

              {/* Treemap Footer Leaders & Laggards */}
              <div className="pt-3.5 mt-3 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Leaders:</span>
                  <span className="text-up font-bold">Bank +3.7%, Pharma +3.6%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Laggards:</span>
                  <span className="text-down font-bold">Cap goods -4.2%, Others -2.0%</span>
                </div>
              </div>
            </div>

            {/* India VIX (lg:col-span-4) */}
            <div className="lg:col-span-4 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
                  <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>India VIX</span>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                  </div>
                  <Maximize2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>

                {/* Circular Gauge */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                      {/* Background Track */}
                      <circle
                        cx="80"
                        cy="80"
                        r="66"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.08"
                        strokeWidth="10"
                      />
                      {/* Progress Track (81st percentile) */}
                      <circle
                        cx="80"
                        cy="80"
                        r="66"
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 66}
                        strokeDashoffset={(2 * Math.PI * 66) * (1 - 0.72)}
                        strokeLinecap="round"
                        className="dark:stroke-slate-200"
                      />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-mono text-4xl font-black text-foreground tracking-tight">
                        17.66
                      </span>
                      <span className="font-mono text-xs font-bold text-up mt-1">
                        +2.08
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-up" />
                        <span>Normal</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 30-Sessions Sparkline */}
                <div className="px-2 pt-2">
                  <svg viewBox="0 0 280 35" className="w-full h-9 overflow-visible">
                    <path
                      d="M 0 28 Q 30 25 60 22 T 120 26 T 180 16 T 240 20 T 280 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-foreground/70"
                    />
                  </svg>
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono font-medium mt-1">
                    <span>30 sessions</span>
                    <span>1y 8.7 – 28.9</span>
                  </div>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="pt-3.5 mt-3 border-t border-hairline/60 text-xs font-medium text-muted-foreground">
                81th percentile of the past year · NIFTY daily move ±1.11%
              </div>
            </div>
          </div>
        </>
      )}

      {topSignal && (
        <AutoTradeModal
          signal={topSignal}
          isOpen={topSignalModal}
          onClose={() => setTopSignalModal(false)}
        />
      )}
    </div>
  );
}
