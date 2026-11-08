import React, { useState, useMemo } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import { INITIAL_SIGNALS, QUANT_STRATEGIES } from '../data/signalsData';
import AutoTradeModal from '../components/signals/AutoTradeModal';
import HedgeStrategyCalculator from '../components/signals/HedgeStrategyCalculator';
import Badge from '../components/common/Badge';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  Sparkles,
  BarChart2,
  Clock,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  Percent
} from 'lucide-react';

export default function SignalsView() {
  const { setActiveChartSymbol, marketStatus } = useMarketData();
  const [signals, setSignals] = useState(INITIAL_SIGNALS);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank'); // rank | conviction | rr
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // Filter logic
  const filteredSignals = useMemo(() => {
    return signals
      .filter(s => {
        if (selectedFilter === 'priority') return s.priorityGrade === 'A+';
        if (selectedFilter === 'buy') return s.action === 'BUY';
        if (selectedFilter === 'sell') return s.action === 'SELL';
        if (selectedFilter === 'index') return s.symbol === 'NIFTY' || s.symbol === 'BANKNIFTY';
        if (selectedFilter === 'equities') return s.symbol !== 'NIFTY' && s.symbol !== 'BANKNIFTY';
        return true;
      })
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.symbol.toLowerCase().includes(q) ||
          s.strategyName.toLowerCase().includes(q) ||
          s.action.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'conviction') return b.conviction - a.conviction;
        if (sortBy === 'rr') return parseFloat(b.rrRatio.split(':')[1]) - parseFloat(a.rrRatio.split(':')[1]);
        return a.rank - b.rank;
      });
  }, [signals, selectedFilter, searchQuery, sortBy]);

  const handleOpenTrade = (sig) => {
    setSelectedSignal(sig);
    setIsTradeModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* 1. Institutional Engine Banner */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand animate-ping" />
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                Institutional Quantitative Signal Engine
              </span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                Auto Multi-Factor Algorithms
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground mt-1">
              Live Auto Trade Signals &amp; Predictive Strategy Models
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
              Institutional setups generated using Volume Profile Point of Control (POC), Options Gamma Walls (Support/Resistance floors), Session VWAP confluence, and real-time futures orderflow velocity with exact Stop Loss, Target 1, Target 2, and risk-reward boundaries.
            </p>
          </div>

          <Badge tone={marketStatus === 'Live' ? 'live' : 'closed'} dot={marketStatus === 'Live'}>
            {marketStatus === 'Live' ? 'Quant Engine: STREAMING' : 'Closing Session Signals'}
          </Badge>
        </div>

        {/* 4 Performance KPI Badges */}
        <div className="mt-4 pt-3.5 border-t border-hairline/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="rounded-xl border border-hairline bg-surface-2 p-2.5">
            <span className="text-muted-foreground text-[10.5px] block font-sans font-semibold">Active Setups</span>
            <span className="font-bold text-foreground text-base mt-0.5 block">{signals.length} High-Rank Signals</span>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
            <span className="text-emerald-600 dark:text-emerald-400 text-[10.5px] block font-sans font-semibold">Today's Win Rate</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base mt-0.5 block">83.3% (5 / 6 Won)</span>
          </div>

          <div className="rounded-xl border border-brand/20 bg-brand/5 p-2.5">
            <span className="text-brand text-[10.5px] block font-sans font-semibold">Average Risk:Reward</span>
            <span className="font-bold text-brand text-base mt-0.5 block">1 : 2.65</span>
          </div>

          <div className="rounded-xl border border-hairline bg-surface-2 p-2.5">
            <span className="text-muted-foreground text-[10.5px] block font-sans font-semibold">Net Points Generated</span>
            <span className="font-bold text-up text-base mt-0.5 block">+304.4 Pts / Lot</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-hairline shadow-xs">
          {[
            { id: 'all', label: `All Setups (${signals.length})` },
            { id: 'priority', label: '⭐ Priority #1 A+ Only' },
            { id: 'buy', label: 'BUY / Long' },
            { id: 'sell', label: 'SELL / Short' },
            { id: 'index', label: 'Index F&O' },
            { id: 'equities', label: 'Equities' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedFilter === tab.id
                  ? 'bg-surface-2 text-foreground font-bold shadow-xs border border-hairline'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter ticker or strategy..."
              className="rounded-xl border border-hairline bg-surface-card pl-8 pr-3 py-1.5 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-brand shadow-xs w-48 sm:w-56"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="rounded-xl border border-hairline bg-surface-card px-3 py-1.5 text-xs font-semibold text-foreground outline-none cursor-pointer shadow-xs"
          >
            <option value="rank">Sort: Priority Rank</option>
            <option value="conviction">Sort: Highest Conviction</option>
            <option value="rr">Sort: Best R:R</option>
          </select>
        </div>
      </div>

      {/* 3. Signal Cards Feed */}
      <div className="space-y-4">
        {filteredSignals.map(sig => {
          const isBuy = sig.action === 'BUY';
          const isHold = sig.action === 'HOLD';
          const isAplus = sig.priorityGrade === 'A+';

          // Progress position of current price between SL and Target 1
          const totalSpan = Math.abs(sig.target1 - sig.sl) || 1;
          const currentProgress = Math.max(0, Math.min(100, ((sig.currentLtp - sig.sl) / totalSpan) * 100));

          return (
            <div
              key={sig.id}
              className={`rounded-2xl border p-4 sm:p-5 shadow-card transition-all ${
                isAplus
                  ? 'border-brand/40 bg-surface-card hover:border-brand shadow-glow'
                  : 'border-hairline bg-surface-card hover:border-hairline/80'
              }`}
            >
              {/* Header row: Rank, Symbol, Action, Conviction, and Horizon */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-hairline/60">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Rank Pill */}
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black tracking-wider ${
                    isAplus
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-surface-2 text-foreground border border-hairline'
                  }`}>
                    <Sparkles className="h-3 w-3" />
                    <span>{sig.priorityLabel}</span>
                  </span>

                  {/* Action Pill */}
                  <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-black ${
                    isBuy
                      ? 'bg-up/15 text-up border border-up/30'
                      : isHold
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : 'bg-down/15 text-down border border-down/30'
                  }`}>
                    {isBuy ? <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" /> : isHold ? <SlidersHorizontal className="h-3.5 w-3.5 stroke-[3]" /> : <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />}
                    <span>{sig.action} · {sig.side}</span>
                  </span>

                  {/* Symbol */}
                  <span className="font-mono text-base sm:text-lg font-black text-foreground">
                    {sig.symbol}
                  </span>

                  <span className="text-xs text-muted-foreground font-mono">
                    {sig.instrument}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground justify-end">
                      <span>Conviction:</span>
                      <span className="text-brand font-mono font-black">{sig.conviction}%</span>
                      <span className="text-amber-400">★★★★★</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Win Prob: {sig.winProbability}% · {sig.timestamp}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveChartSymbol({ symbol: sig.symbol, ltp: sig.spot })}
                    className="p-1.5 rounded-lg border border-hairline bg-surface-2 hover:text-brand transition-colors text-muted-foreground"
                    title="Open Technical Chart"
                  >
                    <BarChart2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Strategy Name & Microstructure Rationale */}
              <div className="py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-heading text-sm font-bold text-foreground">
                    Strategy: {sig.strategyName}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">· Horizon: {sig.horizonLabel}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sig.rationale}
                </p>
              </div>

              {/* Price Metrics Grid: Entry, SL, Target 1, Target 2, Target 3, R:R */}
              <div className="pt-2 pb-3 grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs font-mono">
                {/* Entry */}
                <div className="rounded-xl border border-hairline bg-surface-2 p-2.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Entry Level</span>
                  <span className="font-black text-foreground text-sm mt-0.5 block">₹{sig.entry.toLocaleString()}</span>
                  <span className="text-[9.5px] text-muted-foreground">Spot: ₹{sig.spot.toLocaleString()}</span>
                </div>

                {/* Stop Loss */}
                <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-2.5">
                  <span className="text-[10px] text-rose-500 uppercase font-bold block">Stop Loss (SL)</span>
                  <span className="font-black text-rose-500 text-sm mt-0.5 block">₹{sig.sl.toLocaleString()}</span>
                  <span className="text-[9.5px] text-rose-500 font-bold">-{sig.slPts} pts (-{sig.slPct}%)</span>
                </div>

                {/* Target 1 */}
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-2.5">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">Target 1 (1.5R)</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">₹{sig.target1.toLocaleString()}</span>
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold">+{sig.target1Pts} pts</span>
                </div>

                {/* Target 2 */}
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-2.5">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">Target 2 (2.5R)</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">₹{sig.target2.toLocaleString()}</span>
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold">+{sig.target2Pts} pts</span>
                </div>

                {/* Target 3 */}
                <div className="rounded-xl border border-hairline bg-surface-2 p-2.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Target 3 (Runner)</span>
                  <span className="font-black text-foreground text-sm mt-0.5 block">₹{sig.target3.toLocaleString()}</span>
                  <span className="text-[9.5px] text-muted-foreground">+{sig.target3Pts} pts</span>
                </div>

                {/* Risk : Reward */}
                <div className="rounded-xl border border-brand/25 bg-brand/5 p-2.5">
                  <span className="text-[10px] text-brand uppercase font-bold block">Risk : Reward</span>
                  <span className="font-black text-brand text-sm mt-0.5 block">{sig.rrRatio}</span>
                  <span className="text-[9.5px] text-brand font-bold">Optimal Asymmetry</span>
                </div>
              </div>

              {/* Visual Risk-Reward Bar */}
              <div className="pt-2 pb-3">
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground font-semibold mb-1">
                  <span className="text-rose-500">SL ₹{sig.sl}</span>
                  <span className="text-foreground">Current ₹{sig.currentLtp}</span>
                  <span className="text-emerald-500">T1 ₹{sig.target1}</span>
                  <span className="text-emerald-500">T2 ₹{sig.target2}</span>
                </div>
                <div className="h-2 w-full bg-surface-muted rounded-full relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-brand to-emerald-500 rounded-full"
                    style={{ width: `${Math.max(5, Math.min(100, currentProgress))}%` }}
                  />
                </div>
              </div>

              {/* Institutional Evidence Badges & Auto-Execute Button */}
              <div className="pt-3 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {sig.factors.map((f, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-2 px-2.5 py-1 text-[11px] font-medium"
                    >
                      <span className="text-muted-foreground">{f.label}:</span>
                      <strong className={`font-mono font-bold ${
                        f.tone === 'up' ? 'text-up' : f.tone === 'down' ? 'text-down' : 'text-foreground'
                      }`}>
                        {f.value}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleOpenTrade(sig)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand/90 px-4 py-2 text-xs font-bold text-white transition-colors shadow-glow"
                  >
                    <Zap className="h-3.5 w-3.5 fill-white" />
                    <span>Auto Trade Ticket</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Quantitative Strategy Playbook Reference Section */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div className="flex items-center gap-2 pb-3 border-b border-hairline/60">
          <Layers className="h-4 w-4 text-brand" />
          <h2 className="font-heading text-sm font-bold text-foreground">
            Quantitative Predictive Models Active in Engine
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3.5">
          {QUANT_STRATEGIES.map(strat => (
            <div key={strat.id} className="rounded-xl border border-hairline bg-surface-2 p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading text-xs font-bold text-foreground">{strat.name}</span>
                  <span className="rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold text-brand uppercase">{strat.type}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                  {strat.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-hairline flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">Win Rate: {strat.winRate}</span>
                <span className="text-foreground">Avg R:R: {strat.avgRR}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 90%+ Probability of Profit Hedged Trade & Regulatory Charges Calculator */}
      <HedgeStrategyCalculator />

      {/* Auto Trade Execution Modal */}
      {selectedSignal && (
        <AutoTradeModal
          signal={selectedSignal}
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
        />
      )}
    </div>
  );
}

