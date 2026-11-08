import React, { useState, useMemo } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Badge from '../components/common/Badge';
import {
  Calendar,
  Layers,
  TrendingUp,
  Shield,
  Activity,
  Maximize2,
  X,
  CheckCircle2,
  BarChart2,
  Info,
  ArrowUpRight
} from 'lucide-react';

function formatOi(val) {
  if (!val || isNaN(val)) return '';
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
    const range = optionData.range || [];
    if (range.length < 2) return { topStrike: null, bottomStrike: null };
    const minR = range[0];
    const maxR = range[1];
    const inRange = strikeBars.filter(b => b.k >= minR && b.k <= maxR);
    if (!inRange.length) return { topStrike: null, bottomStrike: null };
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

    // Standard ticks matching Tredye
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
    const pcr = optionData.pcr || 1.0;
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
      {/* Top Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-3.5 sm:p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          {/* Symbol Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase">Underlying:</span>
            <select
              value={selectedOptionSymbol}
              onChange={e => setSelectedOptionSymbol(e.target.value)}
              className="rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-heading text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              {optionsSymbols.map(s => (
                <option key={s} value={s} className="bg-surface-card text-foreground">{s}</option>
              ))}
            </select>
          </div>

          {/* Expiry Select */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedExpiry}
              onChange={e => setSelectedExpiry(e.target.value)}
              className="rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              {expiries.map(exp => (
                <option key={exp} value={exp} className="bg-surface-card text-foreground">{exp}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={marketStatus === 'Live' ? 'live' : 'closed'} dot={marketStatus === 'Live'}>
            {marketStatus === 'Live' ? 'Live ' + optionData.chain_ts : marketSubtext}
          </Badge>

          <button
            onClick={() => setActiveChartSymbol({ symbol: selectedOptionSymbol, ltp: optionData.spot })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors"
          >
            <BarChart2 className="h-3.5 w-3.5 text-brand" />
            <span>Interactive Chart</span>
          </button>

          <button
            onClick={() => setIsChainTableOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Full Chain &amp; Greeks Table</span>
          </button>
        </div>
      </div>

      {/* Main Options Grid Matching Screenshot */}
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

              {/* Legend matching screenshot */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#86efac] dark:bg-emerald-400/70" />
                  <span>put OI</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#fca5a5] dark:bg-rose-400/70" />
                  <span>call OI</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#15803d] dark:bg-emerald-600" />
                  <span>added today</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs border border-foreground/50 bg-transparent" />
                  <span>cut today</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#e9d5ff] dark:bg-purple-900/50" />
                  <span>writers' range</span>
                </span>
              </div>
            </div>

            {/* Top Right: Bias Badge & Toggle */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-up/10 px-2.5 py-0.5 text-xs font-semibold text-up">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>{optionData.bias || 'bullish'} · {optionData.confidence || 'low'}</span>
              </span>
              <button
                onClick={() => setIsChainTableOpen(true)}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                title="View full chain table"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Sub-header columns */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-up font-semibold">
              <span className="h-2 w-2 rounded-full bg-up" />
              <span>Put OI · support</span>
            </div>
            <div className="flex items-center gap-1.5 text-down font-semibold">
              <span className="h-2 w-2 rounded-full bg-down" />
              <span>Call OI · resistance</span>
            </div>
          </div>

          {/* Bidirectional Horizontal Bars Container */}
          <div className="relative py-2 overflow-x-auto select-none">
            <div className="min-w-[500px]">
              {strikeBars.map((row, idx) => {
                const strike = row.k;
                const coi = row.coi || 0;
                const poi = row.poi || 0;
                const cchg = row.cchg || 0;
                const pchg = row.pchg || 0;

                // Writers range state
                const isInRange =
                  writersRange.topStrike &&
                  writersRange.bottomStrike &&
                  strike <= writersRange.topStrike &&
                  strike >= writersRange.bottomStrike;
                const isTopRange = strike === writersRange.topStrike;
                const isBottomRange = strike === writersRange.bottomStrike;

                // Max pain indicator
                const isMaxPain = strike === optionData.max_pain;

                // Spot price position: check if spot is between this row and the next row (since descending)
                const nextRow = strikeBars[idx + 1];
                const isSpotBetween =
                  nextRow && strike > optionData.spot && optionData.spot >= nextRow.k;

                // Prominent label threshold (~top prominent bars like 1.48L, 99.17K, 1.39L)
                const showCallLabel = coi >= maxSpan * 0.48 && coi >= 1000;
                const showPutLabel = poi >= maxSpan * 0.48 && poi >= 1000;

                return (
                  <React.Fragment key={strike}>
                    <div
                      onMouseEnter={() => setHoveredStrike(row)}
                      onMouseLeave={() => setHoveredStrike(null)}
                      className={`relative flex items-center h-[20px] transition-colors ${
                        isInRange
                          ? 'bg-[#ede9fe]/45 dark:bg-[#581c87]/15'
                          : 'hover:bg-surface-2/60'
                      } ${
                        isTopRange
                          ? 'border-t-2 border-[#c084fc] dark:border-[#a855f7]'
                          : ''
                      } ${
                        isBottomRange
                          ? 'border-b-2 border-[#c084fc] dark:border-[#a855f7]'
                          : ''
                      }`}
                    >
                      {/* Left: Put Bar (Grows leftwards towards edge) */}
                      <div className="flex-1 flex items-center justify-end h-full pr-1.5">
                        {showPutLabel && (
                          <span className="mr-1.5 text-[10px] font-mono font-medium text-foreground-secondary shrink-0 select-none">
                            {formatOi(poi)}
                          </span>
                        )}

                        {pchg >= 0 ? (
                          // Added today: [ Added (Dark Green) ] [ Base (Pastel Green) ]
                          <div
                            className="flex items-center justify-end h-3"
                            style={{
                              width: `${Math.min(95, Math.max(1, (poi / maxSpan) * 100))}%`
                            }}
                          >
                            {pchg > 0 && (
                              <div
                                className="h-full bg-[#15803d] dark:bg-emerald-600 rounded-l-xs"
                                style={{ width: `${(pchg / poi) * 100}%` }}
                                title={`Put Added: +${pchg.toLocaleString()}`}
                              />
                            )}
                            {poi - pchg > 0 && (
                              <div
                                className="h-full bg-[#86efac] dark:bg-emerald-400/70 rounded-r-xs"
                                style={{ width: `${((poi - pchg) / poi) * 100}%` }}
                                title={`Put Base: ${(poi - pchg).toLocaleString()}`}
                              />
                            )}
                          </div>
                        ) : (
                          // Cut today: [ Cut (Hollow Border) ] [ Current (Pastel Green) ]
                          <div
                            className="flex items-center justify-end h-3"
                            style={{
                              width: `${Math.min(
                                95,
                                Math.max(1, ((poi + Math.abs(pchg)) / maxSpan) * 100)
                              )}%`
                            }}
                          >
                            <div
                              className="h-full border border-emerald-500 bg-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-400/10 rounded-l-xs"
                              style={{
                                width: `${(Math.abs(pchg) / (poi + Math.abs(pchg))) * 100}%`
                              }}
                              title={`Put Cut: -${Math.abs(pchg).toLocaleString()}`}
                            />
                            {poi > 0 && (
                              <div
                                className="h-full bg-[#86efac] dark:bg-emerald-400/70 rounded-r-xs"
                                style={{
                                  width: `${(poi / (poi + Math.abs(pchg))) * 100}%`
                                }}
                                title={`Put Current: ${poi.toLocaleString()}`}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Center: Strike Column */}
                      <div className="w-14 text-center font-mono text-[11px] font-semibold text-foreground/80 shrink-0 z-10">
                        {strike.toLocaleString()}
                      </div>

                      {/* Right: Call Bar (Grows rightwards towards edge) */}
                      <div className="flex-1 flex items-center justify-start h-full pl-1.5">
                        {cchg >= 0 ? (
                          // Added today: [ Base (Pastel Red) ] [ Added (Dark Red) ]
                          <div
                            className="flex items-center justify-start h-3"
                            style={{
                              width: `${Math.min(95, Math.max(1, (coi / maxSpan) * 100))}%`
                            }}
                          >
                            {coi - cchg > 0 && (
                              <div
                                className="h-full bg-[#fca5a5] dark:bg-rose-400/70 rounded-l-xs"
                                style={{ width: `${((coi - cchg) / coi) * 100}%` }}
                                title={`Call Base: ${(coi - cchg).toLocaleString()}`}
                              />
                            )}
                            {cchg > 0 && (
                              <div
                                className="h-full bg-[#dc2626] dark:bg-rose-600 rounded-r-xs"
                                style={{ width: `${(cchg / coi) * 100}%` }}
                                title={`Call Added: +${cchg.toLocaleString()}`}
                              />
                            )}
                          </div>
                        ) : (
                          // Cut today: [ Current (Pastel Red) ] [ Cut (Hollow Border) ]
                          <div
                            className="flex items-center justify-start h-3"
                            style={{
                              width: `${Math.min(
                                95,
                                Math.max(1, ((coi + Math.abs(cchg)) / maxSpan) * 100)
                              )}%`
                            }}
                          >
                            {coi > 0 && (
                              <div
                                className="h-full bg-[#fca5a5] dark:bg-rose-400/70 rounded-l-xs"
                                style={{
                                  width: `${(coi / (coi + Math.abs(cchg))) * 100}%`
                                }}
                                title={`Call Current: ${coi.toLocaleString()}`}
                              />
                            )}
                            <div
                              className="h-full border border-red-500 bg-red-500/10 dark:border-red-400 dark:bg-red-400/10 rounded-r-xs"
                              style={{
                                width: `${(Math.abs(cchg) / (coi + Math.abs(cchg))) * 100}%`
                              }}
                              title={`Call Cut: -${Math.abs(cchg).toLocaleString()}`}
                            />
                          </div>
                        )}

                        {showCallLabel && (
                          <span className="ml-1.5 text-[10px] font-mono font-medium text-foreground-secondary shrink-0 select-none">
                            {formatOi(coi)}
                          </span>
                        )}
                      </div>

                      {/* Max Pain Marker on Strike Row */}
                      {isMaxPain && (
                        <div className="absolute inset-x-0 bottom-0 pointer-events-none z-20">
                          <div className="h-[1.5px] bg-[#8b5cf6] w-full" />
                          <div className="absolute right-2 -bottom-2.5 bg-surface-card border border-[#8b5cf6]/60 text-[#8b5cf6] px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-sm">
                            MAX PAIN {optionData.max_pain.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Spot Marker between rows */}
                    {isSpotBetween && (
                      <div className="relative py-0.5 my-0.5 z-20">
                        <div className="h-[1.5px] bg-foreground/60 w-full" />
                        <div className="absolute left-2 -top-2.5 bg-surface-card border border-hairline px-2 py-0.5 rounded text-[10px] font-mono font-bold text-foreground shadow-sm">
                          SPOT {optionData.spot.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Put-call ratio & IV smile (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Card 1: Put-call ratio */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>Put-call ratio</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
            </div>

            {/* Semicircular Speedometer Arc Gauge */}
            <div className="py-2 flex flex-col items-center">
              <div className="relative w-64 h-36 flex items-end justify-center">
                <svg viewBox="0 0 240 145" className="w-full h-full overflow-visible">
                  {/* Arc Segment 1: Call-heavy (Red) */}
                  <path
                    d={describeArc(120, 100, 72, 195, 126)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Arc Segment 2: Neutral (Gray) */}
                  <path
                    d={describeArc(120, 100, 72, 120, 74)}
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-600"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Arc Segment 3: Put-heavy (Green) */}
                  <path
                    d={describeArc(120, 100, 72, 68, -15)}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Indicator Pointer Knob */}
                  <circle
                    cx={pcrKnob.x}
                    cy={pcrKnob.y}
                    r="9.5"
                    fill="#0f172a"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx={pcrKnob.x}
                    cy={pcrKnob.y}
                    r="3"
                    fill="#ffffff"
                  />
                </svg>

                {/* Big Center Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none select-none">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono tracking-tight leading-none">
                    {optionData.pcr.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                    PCR
                  </span>
                </div>
              </div>

              {/* End Labels */}
              <div className="flex justify-between w-full px-5 text-xs font-medium text-muted-foreground -mt-1 select-none">
                <span>Call-heavy</span>
                <span>Put-heavy</span>
              </div>
            </div>

            {/* Bottom Verdict Line */}
            <div className="pt-3 border-t border-hairline/60 text-xs font-semibold text-foreground text-center">
              {optionData.pcr > 1.2
                ? 'Put-heavy: writers defending downside'
                : optionData.pcr < 0.8
                ? 'Call-heavy: writers capping upside'
                : 'Balanced positioning: neutral bias'}{' '}
              · Δ-PCR {optionData.pcr_chg >= 0 ? optionData.pcr_chg : optionData.pcr_chg}
            </div>
          </div>

          {/* Card 2: IV smile */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card flex flex-col justify-between">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-1.5 font-heading text-sm font-bold text-foreground">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>IV smile</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>

              {/* Legend matching screenshot */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                  {/* Gridlines & Y-axis labels */}
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

                  {/* Spot Price Vertical Dashed Line */}
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
                        spot {Math.round(optionData.spot).toLocaleString()}
                      </text>
                    </g>
                  )}

                  {/* Put IV Curve (Green) */}
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

                  {/* Call IV Curve (Red) */}
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

                  {/* Bottom X-axis Ticks */}
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
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">
                Loading Volatility Skew Curve...
              </div>
            )}

            {/* Bottom Stats Summary matching screenshot */}
            <div className="pt-3 border-t border-hairline/60 text-xs font-semibold text-foreground text-center">
              ATM IV {optionData.atm_iv}% · straddle ₹{Number(optionData.straddle).toFixed(1)} · max pain {optionData.max_pain.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Spot Price */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Spot Price</span>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            ₹{optionData.spot.toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            {marketStatus === 'Live' ? 'Real-time LTP' : 'Closing snapshot'}
          </span>
        </div>

        {/* Max Pain Strike */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Max Pain Strike</span>
          <div className="mt-1 font-mono text-2xl font-bold text-[#8b5cf6]">
            {optionData.max_pain.toLocaleString()}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Minimum writer payout level
          </span>
        </div>

        {/* ATM Straddle & Expected Move */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">ATM Straddle</span>
          <div className="mt-1 font-mono text-2xl font-bold text-brand">
            ₹{optionData.straddle}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono font-medium">
            Expected: ±{((optionData.straddle / optionData.spot) * 100).toFixed(2)}%
          </span>
        </div>

        {/* ATM Implied Volatility */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">ATM IV / PCR</span>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {optionData.atm_iv}% <span className="text-sm font-semibold text-muted-foreground">/ {optionData.pcr}</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono font-medium">
            Δ-PCR: {optionData.pcr_chg > 0 ? '+' : ''}{optionData.pcr_chg}
          </span>
        </div>
      </div>

      {/* "What The Option Chain Says" Algorithmic Insights */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-hairline">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-2 text-brand border border-hairline/40">
            <Shield className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-heading text-sm font-bold tracking-tight text-foreground">
            What The Option Chain Says (Algorithmic Insights)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-foreground-secondary leading-relaxed font-medium">
          {(optionData.bullets || []).map((bullet, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-hairline bg-surface-2 p-3">
              <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </div>
          ))}
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
