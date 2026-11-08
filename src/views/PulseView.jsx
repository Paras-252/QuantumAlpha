import React from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Gauge from '../components/common/Gauge';
import MiniChart from '../components/common/MiniChart';
import PulseFlowView from '../components/pulse/PulseFlowView';
import PulseOrderflowView from '../components/pulse/PulseOrderflowView';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Gauge as GaugeIcon,
  Layers,
  ArrowRight,
  Flame,
  Zap,
  BarChart2,
  DollarSign,
  Maximize2
} from 'lucide-react';

export default function PulseView() {
  const {
    indices,
    vix,
    mood,
    sectors,
    marketStatus,
    marketSubtext,
    isLiveSimulating,
    setIsLiveSimulating,
    setCurrentScreen,
    setActiveChartSymbol,
    pulseView,
    changePulseView
  } = useMarketData();

  // Leaders & Laggards
  const sortedSectors = [...sectors].sort((a, b) => b.p - a.p);
  const leaders = sortedSectors.slice(0, 2);
  const laggards = sortedSectors.slice(-2).reverse();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Tredye Pulse Subview Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-2 sm:p-2.5 shadow-card">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 border border-hairline/80 overflow-x-auto no-scrollbar">
          <button
            onClick={() => changePulseView('overview')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              pulseView === 'overview'
                ? 'bg-surface-card text-foreground shadow-sm border border-hairline'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => changePulseView('flow')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              pulseView === 'flow'
                ? 'bg-surface-card text-foreground shadow-sm border border-hairline'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Capital Flow</span>
          </button>

          <button
            onClick={() => changePulseView('orderflow')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              pulseView === 'orderflow'
                ? 'bg-surface-card text-foreground shadow-sm border border-hairline'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Orderflow &amp; Depth</span>
          </button>
        </div>

        <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between px-1">
          <Badge tone={marketStatus === 'Live' ? 'live' : 'closed'} dot={marketStatus === 'Live'}>
            NSE {marketStatus} {marketStatus !== 'Live' && '· ' + marketSubtext}
          </Badge>

          <button
            onClick={() => setIsLiveSimulating(prev => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
              isLiveSimulating
                ? 'bg-up/12 text-up border-up/30 hover:bg-up/20'
                : 'bg-surface-2 text-muted-foreground border-hairline hover:text-foreground'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{isLiveSimulating ? 'Simulated Ticks: ON' : 'Close: FROZEN'}</span>
          </button>
        </div>
      </div>

      {/* Render Subview Based on ?view= Parameter */}
      {pulseView === 'flow' ? (
        <PulseFlowView />
      ) : pulseView === 'orderflow' ? (
        <PulseOrderflowView />
      ) : (
        <>
          {/* Top Banner / Pulse Summary */}
          <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`flex h-2 w-2 rounded-full ${marketStatus === 'Live' ? 'bg-up animate-ping' : 'bg-muted-foreground'}`} />
                  <span className="text-xs font-bold text-brand tracking-wider uppercase">
                    NSE Market Intelligence
                  </span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {marketStatus === 'Live' ? 'Live Delayed Feed (1-min)' : 'Last Closing Session (Official NSE Disclosures)'}
                  </span>
                </div>
                <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
                  Market Pulse &amp; Capital Flow
                </h1>
              </div>
            </div>

            {/* Real Tape Algorithmic Headline matching Tredye */}
            {mood.headline && (
              <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-hairline/70 bg-surface-2 px-3.5 py-2 text-xs sm:text-[13px] text-foreground font-medium shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-up shrink-0" />
                <span className="text-muted-foreground font-semibold shrink-0">Market Tape:</span>
                <span className="font-semibold text-foreground tracking-tight">{mood.headline}</span>
              </div>
            )}
          </div>

          {/* 4 Major Indices Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            {indices.map((idx) => {
              const isUp = idx.change >= 0;
              const color = isUp ? '#16a34a' : '#dc2626';

              return (
                <div
                  key={idx.symbol}
                  onClick={() => setActiveChartSymbol(idx)}
                  className="group cursor-pointer rounded-2xl border border-hairline bg-surface-card p-4 shadow-card hover:border-brand/50 hover:shadow-glow transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading text-sm font-bold text-foreground">
                          {idx.symbol}
                        </span>
                        <Maximize2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Badge tone={idx.bias === 'BULLISH' ? 'up' : idx.bias === 'BEARISH' ? 'down' : 'neutral'}>
                        {idx.bias}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-bold text-foreground">
                        {idx.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold flex items-center ${
                          isUp ? 'text-up' : 'text-down'
                        }`}
                      >
                        {isUp ? '+' : ''}{idx.change.toFixed(2)} ({isUp ? '+' : ''}{idx.pChange.toFixed(2)}%)
                      </span>
                    </div>

                    {/* Day range indicator */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-1 font-semibold">
                        <span>L: {idx.low.toFixed(1)}</span>
                        <span>H: {idx.high.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${Math.max(5, Math.min(95, ((idx.ltp - idx.low) / (idx.high - idx.low || 1)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Real Expected Expiry Range & Walls */}
                    {idx.range && idx.range.length === 2 && (
                      <div className="mt-2.5 flex items-center justify-between text-[10.5px] font-mono text-muted-foreground border-t border-hairline/60 pt-2 font-medium">
                        <span>Range: <strong className="text-foreground">{Math.round(idx.range[0]).toLocaleString()} – {Math.round(idx.range[1]).toLocaleString()}</strong></span>
                        {idx.walls && (
                          <span>Walls: <span className="text-up font-bold">{idx.walls[0]}P</span> · <span className="text-down font-bold">{idx.walls[1]}C</span></span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sparkline */}
                  <div className="mt-3 pt-2 border-t border-hairline/60">
                    <MiniChart data={idx.sparkline} color={color} height={34} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Money Flow Ribbon */}
          <Card
            title="Institutional Money Flow Ribbon"
            icon={Activity}
            info="Real-time institutional capital rotation across sectors: Left represents capital outflow, center represents net flow, and right represents net capital absorption."
            legend={
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-down" /> Leaving
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-brand" /> Net Flow ({mood.netFlow >= 0 ? '+' : ''}₹{mood.netFlow.toLocaleString()} cr)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-up" /> Arriving
                </span>
              </div>
            }
          >
            <div className="relative overflow-hidden rounded-xl bg-surface-2 p-4 border border-hairline/40">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Outflow side */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-down/15 text-down">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Outflow Pressure</p>
                    <p className="font-mono text-xs sm:text-sm font-bold text-down">
                      {laggards.map(l => `${l.g} (${l.flow < 0 ? '-' : ''}₹${Math.abs(l.flow).toLocaleString()} cr)`).join(' · ')}
                    </p>
                  </div>
                </div>

                {/* Visual Animated Ribbon */}
                <div className="flex-1 w-full max-w-md">
                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-down via-brand to-up relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-mono font-semibold">
                    <span>-₹{mood.outflow.toLocaleString()} cr</span>
                    <span className="text-brand font-bold">{mood.netFlow >= 0 ? '+' : ''}₹{mood.netFlow.toLocaleString()} cr Net</span>
                    <span>+₹{mood.inflow.toLocaleString()} cr</span>
                  </div>
                </div>

                {/* Inflow side */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-up/15 text-up">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">Inflow Absorption</p>
                    <p className="font-mono text-xs sm:text-sm font-bold text-up">
                      {leaders.map(l => `${l.g} (+₹${l.flow.toLocaleString()} cr)`).join(' · ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Grid: Market Mood, India VIX & Breadth */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Market Mood Gauge (lg:col-span-6) */}
            <Card
              className="lg:col-span-6"
              title="Market Mood Index"
              icon={GaugeIcon}
              info="0 = Extreme Risk-Off, 100 = Extreme Risk-On. A composite blend of market breadth, money flow, NIFTY signal score and India VIX."
              status={<Badge tone="live">Score: {mood.score}</Badge>}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
                <Gauge
                  value={mood.score}
                  min={0}
                  max={100}
                  label={mood.score}
                  sublabel={mood.label}
                  endLabels={['Risk-Off', 'Risk-On']}
                />

                {/* Breakdown bars */}
                <div className="flex-1 w-full space-y-2.5 text-xs">
                  <p className="text-[11px] font-bold text-subtle-foreground uppercase tracking-wider">
                    Driver Contribution (-1 to +1)
                  </p>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground font-medium">Market Breadth</span>
                      <span className="font-mono font-bold text-up">+{mood.breadthScore.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full bg-up rounded-full"
                        style={{ width: `${(mood.breadthScore + 1) * 50}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground font-medium">Money Flow</span>
                      <span className="font-mono font-bold text-up">+{mood.flowScore.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full bg-up rounded-full"
                        style={{ width: `${(mood.flowScore + 1) * 50}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground font-medium">NIFTY Signal Score</span>
                      <span className="font-mono font-bold text-brand">+{mood.niftyScore.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: `${(mood.niftyScore + 1) * 50}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground font-medium">India VIX Volatility</span>
                      <span className="font-mono font-bold text-up">+{mood.vixScore.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className="h-full bg-up rounded-full"
                        style={{ width: `${(mood.vixScore + 1) * 50}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* India VIX & Breadth Card (lg:col-span-6) */}
            <Card
              className="lg:col-span-6"
              title="India VIX &amp; Market Breadth"
              icon={Activity}
              info="Expected annualized NIFTY volatility over the next 30 days and NSE Advancers vs Decliners ratio."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                {/* VIX Stats */}
                <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface-2 p-3.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">India VIX</span>
                      <Badge tone="up">Normal Volatility</Badge>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-mono text-3xl font-bold text-foreground">
                        {vix.ltp.toFixed(2)}
                      </span>
                      <span className="font-mono text-xs font-bold text-up">
                        {vix.pChange}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground border-t border-hairline pt-2 font-medium">
                    <div className="flex justify-between">
                      <span>Yearly Percentile:</span>
                      <strong className="font-mono text-foreground">{vix.pctile}th %ile</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Daily Move:</span>
                      <strong className="font-mono text-foreground">±{vix.expected_nifty_daily_move}%</strong>
                    </div>
                  </div>
                </div>

                {/* Advance Decline Breadth */}
                <div className="flex flex-col justify-between rounded-xl border border-hairline bg-surface-2 p-3.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">Market Breadth</span>
                      <span className="font-mono text-xs font-bold text-up">
                        {(mood.advancers / mood.decliners).toFixed(2)}:1 Ratio
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mt-1 font-mono">
                      <span className="text-up font-bold text-lg">{mood.advancers} Adv</span>
                      <span className="text-down font-bold text-lg">{mood.decliners} Dec</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden flex">
                      <div
                        className="h-full bg-up"
                        style={{
                          width: `${(mood.advancers / (mood.advancers + mood.decliners)) * 100}%`
                        }}
                      />
                      <div
                        className="h-full bg-down"
                        style={{
                          width: `${(mood.decliners / (mood.advancers + mood.decliners)) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-medium">
                      <span>{((mood.advancers / (mood.advancers + mood.decliners)) * 100).toFixed(0)}% Advancers</span>
                      <span>{((mood.decliners / (mood.advancers + mood.decliners)) * 100).toFixed(0)}% Decliners</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sector Treemap Heatmap */}
          <Card
            title="Sector Heatmap &amp; Turnover Map"
            icon={Layers}
            info="Tile area represents trading turnover (volume weight), and tile color represents % change from -4% (deep red) to +4% (deep green)."
            insight={
              <div className="flex flex-wrap items-center gap-3 w-full">
                <span className="font-bold text-foreground">Sector Leaders:</span>
                {leaders.map(l => (
                  <span key={l.g} className="font-mono font-bold text-up">
                    {l.g} (+{l.p}%)
                  </span>
                ))}
                <span className="text-muted-foreground">|</span>
                <span className="font-bold text-foreground">Laggards:</span>
                {laggards.map(l => (
                  <span key={l.g} className="font-mono font-bold text-down">
                    {l.g} ({l.p}%)
                  </span>
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {sectors.map((sec) => {
                const isPositive = sec.p >= 0;
                const intensity = Math.min(100, Math.round((Math.abs(sec.p) / 3.0) * 100));

                return (
                  <div
                    key={sec.name}
                    className="flex flex-col justify-between rounded-xl border border-hairline p-3 transition-transform hover:scale-[1.02] shadow-sm"
                    style={{
                      backgroundColor: isPositive
                        ? `rgba(22, 163, 74, ${0.12 + (intensity / 100) * 0.28})`
                        : `rgba(220, 38, 38, ${0.12 + (intensity / 100) * 0.28})`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-xs font-bold text-foreground">
                        {sec.name}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          isPositive ? 'text-up' : 'text-down'
                        }`}
                      >
                        {isPositive ? '+' : ''}{sec.p.toFixed(2)}%
                      </span>
                    </div>

                    <div className="mt-2.5 flex justify-between items-center text-[10.5px] text-muted-foreground font-mono">
                      <span>₹{sec.turnover.toLocaleString()} cr</span>
                      <span className={sec.flow >= 0 ? 'text-up font-bold' : 'text-down font-bold'}>
                        {sec.flow >= 0 ? '+' : ''}{sec.flow.toLocaleString()} cr
                      </span>
                    </div>

                    {sec.top && sec.top.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-hairline/40 flex items-center justify-between text-[10px] font-mono text-subtle-foreground">
                        <span className="font-semibold text-foreground">{sec.top[0].s}</span>
                        <span className={sec.top[0].p >= 0 ? 'text-up font-bold' : 'text-down font-bold'}>
                          {sec.top[0].p >= 0 ? '+' : ''}{sec.top[0].p.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
