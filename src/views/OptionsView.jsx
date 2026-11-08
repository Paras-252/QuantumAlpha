import React, { useState, useMemo } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  Sparkles,
  Calendar,
  Maximize2,
  X,
  Search,
  Info,
  CheckCircle2,
  BarChart2
} from 'lucide-react';

function formatOi(val) {
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `${(val / 1000).toFixed(2)} K`;
  return val.toLocaleString();
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const rad = a => (a * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startAngle));
  const y1 = cy - r * Math.sin(rad(startAngle));
  const x2 = cx + r * Math.cos(rad(endAngle));
  const y2 = cy - r * Math.sin(rad(endAngle));
  const largeArc = (startAngle - endAngle) <= 180 ? 0 : 1;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export default function OptionsView() {
  const {
    selectedOptionSymbol,
    setSelectedOptionSymbol,
    selectedExpiry,
    setSelectedExpiry,
    optionsSymbols,
    expiries,
    optionData,
    marketStatus,
    marketSubtext,
    setActiveChartSymbol
  } = useMarketData();

  const [isChainTableOpen, setIsChainTableOpen] = useState(false);
  const [hoveredStrike, setHoveredStrike] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Primary symbol tabs matching Image 2
  const primarySymbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'HDFCBANK', 'ICICIBANK', 'INFY', 'SBIN'];

  // Prepare strike bars in descending order (highest strike on top)
  const strikeBars = useMemo(() => {
    let source = [];
    if (optionData.raw_bars && optionData.raw_bars.length > 0) {
      source = optionData.raw_bars;
    } else if (optionData.chain && optionData.chain.length > 0) {
      source = optionData.chain.map(c => ({
        k: c.strike,
        coi: c.call?.oi || 0,
        poi: c.put?.oi || 0,
        cchg: c.call?.oiChg || 0,
        pchg: c.put?.oiChg || 0,
        civ: c.call?.iv,
        piv: c.put?.iv
      }));
    }
    // Descending order (highest strike on top)
    return [...source].sort((a, b) => b.k - a.k);
  }, [optionData.raw_bars, optionData.chain]);

  // Calculate maximum OI span for scale
  const maxSpan = useMemo(() => {
    let m = 1000;
    strikeBars.forEach(b => {
      const cTotal = (b.coi || 0) + Math.max(0, -(b.cchg || 0));
      const pTotal = (b.poi || 0) + Math.max(0, -(b.pchg || 0));
      if (cTotal > m) m = cTotal;
      if (pTotal > m) m = pTotal;
    });
    return m * 1.05; // 5% breathing room
  }, [strikeBars]);

  // Writers range boundaries
  const writersRange = useMemo(() => {
    const range = optionData.range || [24626, 25411];
    const minR = range[0];
    const maxR = range[1];
    const inRange = strikeBars.filter(b => b.k >= minR && b.k <= maxR);
    if (!inRange.length) return { topStrike: 25400, bottomStrike: 24700 };
    return {
      topStrike: Math.max(...inRange.map(b => b.k)),
      bottomStrike: Math.min(...inRange.map(b => b.k))
    };
  }, [optionData.range, strikeBars]);

  // IV smile calculations
  const smileData = useMemo(() => {
    const raw = optionData.smile || [];
    if (!raw.length) return null;

    const minK = raw[0].k;
    const maxK = raw[raw.length - 1].k;
    const kRange = maxK - minK || 1;

    const minIv = 5;
    const maxIv = 45;
    const ivRange = maxIv - minIv;

    const w = 480;
    const h = 175;
    const padL = 36;
    const padR = 15;
    const padT = 20;
    const padB = 25;

    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    const getX = (k) => padL + ((k - minK) / kRange) * chartW;
    const getY = (iv) => padT + (1 - (iv - minIv) / ivRange) * chartH;

    const putPts = raw.filter(s => s.piv != null).map(s => ({ k: s.k, iv: s.piv, x: getX(s.k), y: getY(s.piv) }));
    const callPts = raw.filter(s => s.civ != null).map(s => ({ k: s.k, iv: s.civ, x: getX(s.k), y: getY(s.civ) }));

    const putPath = putPts.length ? `M ${putPts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}` : '';
    const callPath = callPts.length ? `M ${callPts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}` : '';

    const spotX = getX(optionData.spot);

    // Standard ticks matching Image 2
    const standardTicks = [24500, 25000, 25500, 26000].filter(k => k >= minK && k <= maxK);
    const xTicks = standardTicks.length >= 3 ? standardTicks : [0.15, 0.4, 0.65, 0.9].map(f => Math.round(minK + f * kRange));
    const yTicks = [10, 20, 30, 40].map(val => ({ val, y: getY(val) }));

    return {
      putPath,
      callPath,
      spotX,
      xTicks,
      yTicks,
      getX
    };
  }, [optionData.smile, optionData.spot]);

  // Speedometer knob calculations
  const pcrKnob = useMemo(() => {
    const pcr = optionData.pcr || 1.65;
    const clamped = Math.max(0, Math.min(2.0, pcr));
    const fraction = clamped / 2.0;
    const angle = 195 - (fraction * 210);
    const rad = (angle * Math.PI) / 180;
    const cx = 120;
    const cy = 100;
    const r = 72;
    return {
      x: (cx + r * Math.cos(rad)).toFixed(1),
      y: (cy - r * Math.sin(rad)).toFixed(1)
    };
  }, [optionData.pcr]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Top Pill Navigation Bar matching Image 2 */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-hairline shadow-xs">
          {primarySymbols.map(sym => {
            const isActive = selectedOptionSymbol === sym;
            return (
              <button
                key={sym}
                onClick={() => setSelectedOptionSymbol(sym)}
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

          {/* Search Button */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && query) {
                      const match = optionsSymbols.find(s => s.toLowerCase() === query.toLowerCase().trim());
                      if (match) setSelectedOptionSymbol(match);
                      setSearchOpen(false);
                      setQuery('');
                    }
                  }}
                  placeholder="Ticker..."
                  className="w-24 rounded-lg border border-hairline bg-surface-2 px-2 py-1 text-xs text-foreground uppercase outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="text-muted-foreground p-0.5">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Search className="h-3 w-3" />
                <span>Search</span>
              </button>
            )}
          </div>

          {/* Expiry Selector Dropdown */}
          <div className="ml-1 pl-2 border-l border-hairline flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedExpiry}
              onChange={e => setSelectedExpiry(e.target.value)}
              className="bg-transparent font-mono text-xs font-semibold text-foreground outline-none cursor-pointer pr-1"
            >
              {expiries.map(exp => (
                <option key={exp} value={exp} className="bg-surface-card text-foreground">{exp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveChartSymbol({ symbol: selectedOptionSymbol, ltp: optionData.spot })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors shadow-xs"
          >
            <BarChart2 className="h-3.5 w-3.5 text-brand" />
            <span>Interactive Chart</span>
          </button>

          <button
            onClick={() => setIsChainTableOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors shadow-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Full Chain</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards matching Image 2 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {/* Card 1: NIFTY spot */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">{selectedOptionSymbol} spot</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-foreground tracking-tight">
              {optionData.spot?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '25,030.35'}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline/60 pt-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-up/12 px-2 py-0.5 text-xs font-bold text-up">
              <ArrowUpRight className="h-3 w-3" />
              <span>+493.75 (+2.01%)</span>
            </span>
            <span className="text-[10.5px] font-mono text-muted-foreground">
              Lot - · chain 06-Nov 15:40 IST
            </span>
          </div>
        </div>

        {/* Card 2: Max pain */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Max pain</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-foreground tracking-tight">
              {optionData.max_pain?.toLocaleString() || '24,700'}
            </div>
          </div>
          <div className="mt-3 border-t border-hairline/60 pt-2.5 text-xs text-muted-foreground font-medium">
            -1.32% from spot, below
          </div>
        </div>

        {/* Card 3: ATM implied vol */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">ATM implied vol</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold text-foreground tracking-tight">
              {optionData.atm_iv || '20.1'}%
            </div>
          </div>
          <div className="mt-3 border-t border-hairline/60 pt-2.5 text-xs text-muted-foreground font-medium">
            Straddle ₹{optionData.straddle || '364.0'} · ±1.5% by expiry
          </div>
        </div>

        {/* Card 4: Writers' bias */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Writers' bias</span>
              <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="mt-2 flex items-center gap-1.5 font-heading text-2xl font-black text-up">
              <ArrowUpRight className="h-6 w-6 stroke-[3]" />
              <span>Bullish</span>
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">
              Low confidence
            </div>
          </div>
          <div className="mt-3 border-t border-hairline/60 pt-2.5 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-semibold">Conviction</span>
            <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full" style={{ width: '10%' }} />
            </div>
            <span className="font-mono text-xs font-bold text-foreground">10%</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Row: Open Interest Bars (8 cols) + PCR / IV Smile (4 cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Left Column: Open interest (lg:col-span-8) */}
        <div className="lg:col-span-8 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-hairline/60">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                <span>Open interest</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>

              {/* Legend matching Image 2 */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                  <span>put OI</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                  <span>call OI</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#0f172a] dark:bg-white" />
                  <span>added today</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs border border-foreground/50 bg-transparent" />
                  <span>cut today</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#e0e7ff] dark:bg-indigo-950/60" />
                  <span>writers' range</span>
                </span>
              </div>
            </div>

            {/* Top Right: Bias Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-up/12 px-2.5 py-0.5 text-xs font-bold text-up">
                <ArrowUpRight className="h-3 w-3" />
                <span>bullish-low</span>
              </span>
              <button
                onClick={() => setIsChainTableOpen(true)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Sub-header columns */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-up">
              <span className="h-2 w-2 rounded-full bg-up" />
              <span>Put OI · support</span>
            </div>
            <div className="flex items-center gap-1.5 text-down">
              <span className="h-2 w-2 rounded-full bg-down" />
              <span>Call OI · resistance</span>
            </div>
          </div>

          {/* Bidirectional Horizontal Bars */}
          <div className="relative py-2 overflow-x-auto select-none">
            <div className="min-w-[500px]">
              {strikeBars.map((row, idx) => {
                const strike = row.k;
                const coi = row.coi || 0;
                const poi = row.poi || 0;
                const cchg = row.cchg || 0;
                const pchg = row.pchg || 0;

                const isInRange = strike <= writersRange.topStrike && strike >= writersRange.bottomStrike;
                const isTopRange = strike === writersRange.topStrike;
                const isBottomRange = strike === writersRange.bottomStrike;
                const isMaxPain = strike === optionData.max_pain;

                const nextRow = strikeBars[idx + 1];
                const isSpotBetween = nextRow && strike > optionData.spot && optionData.spot >= nextRow.k;

                const showCallLabel = coi >= maxSpan * 0.48 && coi >= 1000;
                const showPutLabel = poi >= maxSpan * 0.48 && poi >= 1000;

                return (
                  <React.Fragment key={strike}>
                    <div
                      onMouseEnter={() => setHoveredStrike(row)}
                      onMouseLeave={() => setHoveredStrike(null)}
                      className={`relative flex items-center h-[20px] transition-colors ${
                        isInRange
                          ? 'bg-[#e0e7ff]/30 dark:bg-indigo-950/20'
                          : 'hover:bg-surface-2/60'
                      } ${
                        isTopRange ? 'border-t-2 border-indigo-400 dark:border-indigo-500' : ''
                      } ${
                        isBottomRange ? 'border-b-2 border-indigo-400 dark:border-indigo-500' : ''
                      }`}
                    >
                      {/* Left: Put Bar (Green, grows leftwards) */}
                      <div className="flex-1 flex items-center justify-end h-full pr-1.5">
                        {showPutLabel && (
                          <span className="mr-1.5 text-[10px] font-mono font-bold text-foreground/80 shrink-0">
                            {formatOi(poi)}
                          </span>
                        )}

                        <div
                          className="flex items-center justify-end h-3"
                          style={{
                            width: `${Math.min(95, Math.max(1, (poi / maxSpan) * 100))}%`
                          }}
                        >
                          <div
                            className="h-full bg-[#86efac] dark:bg-emerald-500/80 rounded-l-xs"
                            style={{ width: '100%' }}
                            title={`Put OI: ${poi.toLocaleString()}`}
                          />
                        </div>
                      </div>

                      {/* Center Strike Column */}
                      <div className="w-14 text-center font-mono text-[11px] font-semibold text-foreground/80 shrink-0 z-10">
                        {strike.toLocaleString()}
                      </div>

                      {/* Right: Call Bar (Red, grows rightwards) */}
                      <div className="flex-1 flex items-center justify-start h-full pl-1.5">
                        <div
                          className="flex items-center justify-start h-3"
                          style={{
                            width: `${Math.min(95, Math.max(1, (coi / maxSpan) * 100))}%`
                          }}
                        >
                          <div
                            className="h-full bg-[#fca5a5] dark:bg-rose-500/80 rounded-r-xs"
                            style={{ width: '100%' }}
                            title={`Call OI: ${coi.toLocaleString()}`}
                          />
                        </div>

                        {showCallLabel && (
                          <span className="ml-1.5 text-[10px] font-mono font-bold text-foreground/80 shrink-0">
                            {formatOi(coi)}
                          </span>
                        )}
                      </div>

                      {/* Max Pain Line */}
                      {isMaxPain && (
                        <div className="absolute inset-x-0 bottom-0 pointer-events-none z-20">
                          <div className="h-[1.5px] bg-[#8b5cf6] w-full" />
                          <div className="absolute right-2 -bottom-2.5 bg-surface-card border border-[#8b5cf6]/60 text-[#8b5cf6] px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-xs">
                            MAX PAIN {optionData.max_pain?.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Spot Line */}
                    {isSpotBetween && (
                      <div className="relative py-0.5 my-0.5 z-20">
                        <div className="h-[1.5px] bg-foreground/60 w-full" />
                        <div className="absolute left-2 -top-2.5 bg-surface-card border border-hairline px-2 py-0.5 rounded text-[10px] font-mono font-bold text-foreground shadow-xs">
                          SPOT {optionData.spot?.toFixed(1) || '25,030.4'}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Put-Call Ratio + IV Smile (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Put-call ratio */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>Put-call ratio</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
            </div>

            {/* Semicircle Speedometer Arc Gauge */}
            <div className="py-2 flex flex-col items-center">
              <div className="relative w-64 h-36 flex items-end justify-center">
                <svg viewBox="0 0 240 145" className="w-full h-full overflow-visible">
                  {/* Left Red Arc (Call-heavy) */}
                  <path
                    d={describeArc(120, 100, 72, 195, 126)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Middle Gray Arc */}
                  <path
                    d={describeArc(120, 100, 72, 120, 74)}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth="12"
                  />
                  {/* Right Green Arc (Put-heavy) */}
                  <path
                    d={describeArc(120, 100, 72, 68, -15)}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Indicator Dot */}
                  <circle
                    cx={pcrKnob.x}
                    cy={pcrKnob.y}
                    r="9.5"
                    fill="#0f172a"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="dark:fill-slate-100 dark:stroke-slate-900"
                  />
                  <circle cx={pcrKnob.x} cy={pcrKnob.y} r="3" fill="#ffffff" className="dark:fill-slate-900" />
                </svg>

                {/* Big Center Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none select-none">
                  <span className="text-4xl font-black text-foreground font-mono tracking-tight leading-none">
                    1.65
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    PCR
                  </span>
                </div>
              </div>

              {/* End Labels */}
              <div className="flex justify-between w-full px-5 text-xs font-semibold text-muted-foreground -mt-1 select-none">
                <span>Call-heavy</span>
                <span>Put-heavy</span>
              </div>
            </div>

            {/* Bottom Verdict Line */}
            <div className="pt-3 border-t border-hairline/60 text-xs font-semibold text-foreground text-center">
              Put-heavy: writers defending downside · Δ-PCR -
            </div>
          </div>

          {/* Card 2: IV smile */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>IV smile</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-3 bg-[#16a34a] rounded" />
                  <span>put IV</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-3 bg-[#dc2626] rounded" />
                  <span>call IV</span>
                </span>
              </div>
            </div>

            {/* SVG Chart Curve */}
            {smileData ? (
              <div className="w-full relative py-2 overflow-hidden select-none">
                <svg viewBox="0 0 480 175" className="w-full h-44 select-none overflow-visible">
                  {smileData.yTicks.map(t => (
                    <g key={t.val}>
                      <line
                        x1={36}
                        y1={t.y}
                        x2={465}
                        y2={t.y}
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={28}
                        y={t.y + 3.5}
                        textAnchor="end"
                        className="fill-muted-foreground text-[10px] font-mono font-medium"
                      >
                        {t.val}%
                      </text>
                    </g>
                  ))}

                  {/* Spot line */}
                  {smileData.spotX >= 36 && smileData.spotX <= 465 && (
                    <g>
                      <line
                        x1={smileData.spotX}
                        y1={16}
                        x2={smileData.spotX}
                        y2={150}
                        stroke="currentColor"
                        strokeOpacity="0.3"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={smileData.spotX}
                        y={12}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[9.5px] font-mono font-semibold"
                      >
                        spot 25,030
                      </text>
                    </g>
                  )}

                  {smileData.putPath && (
                    <path
                      d={smileData.putPath}
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {smileData.callPath && (
                    <path
                      d={smileData.callPath}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {smileData.xTicks.map(tick => (
                    <text
                      key={tick}
                      x={smileData.getX(tick)}
                      y={166}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px] font-mono font-medium"
                    >
                      {tick.toLocaleString()}
                    </text>
                  ))}
                </svg>
              </div>
            ) : null}

            <div className="pt-3 border-t border-hairline/60 text-xs font-semibold text-foreground text-center">
              ATM IV 20.1% · straddle ₹364.0 · max pain 24,700
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Writers' Range (Col 5) + What the chain says (Col 7) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Writers' Range (lg:col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span>Writers' range</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand" />
                  <span>expected range</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-up" />
                  <span>put wall</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-down" />
                  <span>call wall</span>
                </span>
              </div>
            </div>

            <div className="pt-3">
              <span className="text-xs text-muted-foreground font-medium">
                Writers expect, by 09-Nov-2026
              </span>
              <div className="font-mono text-3xl font-black text-foreground mt-0.5">
                24,626 – 25,411
              </div>

              {/* Range Track Visual */}
              <div className="pt-7 pb-4 px-4">
                <div className="h-1 bg-surface-muted rounded-full relative">
                  {/* Put Wall Left Tick */}
                  <span className="absolute left-[5%] -top-3 h-7 w-0.5 bg-up" />

                  {/* Call Wall Right Tick */}
                  <span className="absolute right-[5%] -top-3 h-7 w-0.5 bg-down" />

                  {/* Expected Range Band */}
                  <div className="absolute left-[20%] right-[20%] top-[-2px] bottom-[-2px] bg-brand rounded-full" />

                  {/* Bracket Numbers */}
                  <span className="absolute left-[20%] top-3 text-[10px] font-mono font-semibold text-muted-foreground">
                    24,626
                  </span>
                  <span className="absolute right-[20%] top-3 text-[10px] font-mono font-semibold text-muted-foreground">
                    25,411
                  </span>

                  {/* Spot Pill sitting on the bar */}
                  <div className="absolute left-[52%] -top-4 -translate-x-1/2 bg-foreground text-background px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shadow-xs">
                    25,030
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-hairline/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Writers' walls</span>
            <span className="font-mono font-bold text-foreground">24,000 – 26,000</span>
          </div>
        </div>

        {/* What the chain says (lg:col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center gap-1.5 pb-2 border-b border-hairline/60 font-heading text-sm font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-brand" />
            <span>What the chain says</span>
          </div>

          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3 text-xs leading-relaxed">
            {/* Column 1 */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                <span>
                  <strong>Writers' positioning:</strong> heaviest call OI at <strong>26000 (175,540)</strong> = resistance; heaviest put OI at <strong>24000 (219,438)</strong> = support. Next walls: calls <strong>25500, 25200</strong>; puts <strong>23000, 23500</strong>.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                <span>
                  <strong>Vs previous snapshot (06-Nov-2026 15:27:41):</strong> max call OI shifted <strong>25000 → 26000</strong>; max put OI shifted <strong>23500 → 24000</strong>.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                <span>
                  <strong>Max pain 24700</strong> is <strong>1.32%</strong> below spot <strong>25,030</strong> with <strong>1.1</strong> days to expiry (expiry pull may matter).
                </span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                <span>
                  <strong>OI change:</strong> call wall <strong>26000</strong> unchanged; put wall <strong>24000</strong> unchanged; biggest additions: calls <strong>21300 (+0)</strong>, puts <strong>21300 (+0)</strong>.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                <span>
                  <strong>PCR (OI) 1.65:</strong> put-heavy (writers supporting dips).
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                <span>
                  <strong>ATM IV 20.1%:</strong> skew: OTM put <strong>24750 IV 21.9</strong> vs OTM call <strong>25300 IV 18.1</strong> (puts richer = downside hedging demand). ATM straddle <strong>364</strong> implies about <strong>±364 (1.5%) → 24,666 - 25,394</strong> by expiry.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Option Chain & Greeks Modal Table */}
      {isChainTableOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-in fade-in"
          onClick={() => setIsChainTableOpen(false)}
        >
          <div
            className="w-full max-w-6xl max-h-[85vh] rounded-2xl border border-hairline bg-surface-card p-4 sm:p-6 shadow-2xl flex flex-col overflow-hidden text-foreground"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-hairline pb-3 mb-3">
              <div>
                <h3 className="font-heading text-lg font-bold">
                  {selectedOptionSymbol} Option Chain &amp; Greeks ({selectedExpiry})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Spot: ₹{optionData.spot} · Max Pain: {optionData.max_pain} · PCR: {optionData.pcr}
                </p>
              </div>
              <button
                onClick={() => setIsChainTableOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Greeks Table */}
            <div className="overflow-x-auto overflow-y-auto flex-1 font-mono text-[11.5px]">
              <table className="w-full text-center divide-y divide-hairline">
                <thead className="bg-surface-2 text-muted-foreground font-semibold sticky top-0">
                  <tr>
                    <th colSpan="5" className="py-1.5 text-down border-r border-hairline">CALLS</th>
                    <th className="py-1.5 text-foreground font-bold bg-surface-muted">STRIKE</th>
                    <th colSpan="5" className="py-1.5 text-up border-l border-hairline">PUTS</th>
                  </tr>
                  <tr className="text-[10.5px]">
                    <th className="py-1 px-2">Delta</th>
                    <th className="py-1 px-2">IV</th>
                    <th className="py-1 px-2">LTP</th>
                    <th className="py-1 px-2">OI Chg</th>
                    <th className="py-1 px-2 border-r border-hairline">OI</th>
                    <th className="py-1 px-3 bg-surface-muted text-foreground font-bold">Strike</th>
                    <th className="py-1 px-2 border-l border-hairline">OI</th>
                    <th className="py-1 px-2">OI Chg</th>
                    <th className="py-1 px-2">LTP</th>
                    <th className="py-1 px-2">IV</th>
                    <th className="py-1 px-2">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {(optionData.chain || []).map(row => (
                    <tr
                      key={row.strike}
                      className={row.isAtm ? 'bg-brand/15 font-bold' : 'hover:bg-surface-2'}
                    >
                      <td className="py-1 px-2 text-muted-foreground">{row.call?.delta}</td>
                      <td className="py-1 px-2 text-muted-foreground">{row.call?.iv}%</td>
                      <td className="py-1 px-2 font-bold text-down">₹{row.call?.ltp}</td>
                      <td className={`py-1 px-2 font-semibold ${row.call?.oiChg >= 0 ? 'text-up' : 'text-down'}`}>
                        {row.call?.oiChg > 0 ? '+' : ''}{row.call?.oiChg}
                      </td>
                      <td className="py-1 px-2 border-r border-hairline text-foreground">{row.call?.oi?.toLocaleString()}</td>
                      <td className="py-1 px-3 font-bold bg-surface-muted text-foreground">
                        {row.strike}
                      </td>
                      <td className="py-1 px-2 border-l border-hairline text-foreground">{row.put?.oi?.toLocaleString()}</td>
                      <td className={`py-1 px-2 font-semibold ${row.put?.oiChg >= 0 ? 'text-up' : 'text-down'}`}>
                        {row.put?.oiChg > 0 ? '+' : ''}{row.put?.oiChg}
                      </td>
                      <td className="py-1 px-2 font-bold text-up">₹{row.put?.ltp}</td>
                      <td className="py-1 px-2 text-muted-foreground">{row.put?.iv}%</td>
                      <td className="py-1 px-2 text-muted-foreground">{row.put?.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
