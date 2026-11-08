import React, { useState, useMemo } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Search,
  Zap,
  Filter,
  BarChart2,
  Maximize2,
  ChevronRight,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function PulseFlowView() {
  const {
    flowFeed,
    marketStatus,
    marketSubtext,
    setActiveChartSymbol,
    setSelectedOptionSymbol,
    setCurrentScreen
  } = useMarketData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuildup, setSelectedBuildup] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [onlyFo, setOnlyFo] = useState(false);
  const [onlySurge, setOnlySurge] = useState(false);
  const [sortBy, setSortBy] = useState('flow'); // 'flow' | 'pct' | 'turnover' | 'rv'
  const [visibleCount, setVisibleCount] = useState(50);

  // Sectors from feed
  const sectors = useMemo(() => {
    return flowFeed.sectors || [];
  }, [flowFeed.sectors]);

  // Sector list for filter dropdown
  const sectorNames = useMemo(() => {
    const set = new Set();
    sectors.forEach(s => set.add(s.g));
    return Array.from(set);
  }, [sectors]);

  // Filtered stocks
  const filteredStocks = useMemo(() => {
    const list = flowFeed.stocks || [];
    return list.filter(s => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        s.s.toLowerCase().includes(q) ||
        (s.n && s.n.toLowerCase().includes(q)) ||
        (s.g && s.g.toLowerCase().includes(q));

      // F&O only
      if (onlyFo && !s.fo) return false;

      // Surge only
      if (onlySurge && !s.surge) return false;

      // Sector filter
      if (selectedSector !== 'all' && s.g !== selectedSector) return false;

      // Buildup filter
      if (selectedBuildup !== 'all') {
        const bu = (s.bu || '').toLowerCase();
        if (selectedBuildup === 'long_buildup' && !bu.includes('long buildup')) return false;
        if (selectedBuildup === 'short_covering' && !bu.includes('short covering')) return false;
        if (selectedBuildup === 'short_buildup' && !bu.includes('short buildup')) return false;
        if (selectedBuildup === 'long_unwinding' && !bu.includes('long unwinding')) return false;
      }

      return matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'flow') return Math.abs(b.f || 0) - Math.abs(a.f || 0);
      if (sortBy === 'pct') return (b.p || 0) - (a.p || 0);
      if (sortBy === 'turnover') return (b.tv || 0) - (a.tv || 0);
      if (sortBy === 'rv') return (b.rv || 0) - (a.rv || 0);
      return 0;
    });
  }, [flowFeed.stocks, searchQuery, selectedBuildup, selectedSector, onlyFo, onlySurge, sortBy]);

  // Summary counts
  const counts = useMemo(() => {
    const all = flowFeed.stocks || [];
    return {
      all: all.length,
      fo: all.filter(s => s.fo).length,
      surge: all.filter(s => s.surge).length,
      lb: all.filter(s => (s.bu || '').toLowerCase().includes('long buildup')).length,
      sc: all.filter(s => (s.bu || '').toLowerCase().includes('short covering')).length,
      sb: all.filter(s => (s.bu || '').toLowerCase().includes('short buildup')).length,
      lu: all.filter(s => (s.bu || '').toLowerCase().includes('long unwinding')).length
    };
  }, [flowFeed.stocks]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-up animate-ping" />
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                Capital Flow Intelligence
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground font-mono">
                {flowFeed.oi_ts || flowFeed.ts || '06-Nov-2026 15:40 IST'}
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Sector Money Flow &amp; Institutional Equities
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Tracking net institutional buy/sell pressure across 23 sectors and {flowFeed.n || 501} NSE stocks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="live" dot>
              {marketStatus === 'Live' ? 'Live Flow Feed' : 'Session Snapshot: FROZEN'}
            </Badge>
          </div>
        </div>

        {/* Tape Headline Banner */}
        {flowFeed.summary && (
          <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-hairline/70 bg-surface-2 px-3.5 py-2 text-xs sm:text-[13px] text-foreground font-medium shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-up shrink-0" />
            <span className="text-muted-foreground font-semibold shrink-0">Market Flow Tape:</span>
            <span className="font-semibold text-foreground tracking-tight">{flowFeed.summary}</span>
          </div>
        )}
      </div>

      {/* 4 Macro Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Inflow */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Institutional Inflow</span>
          <div className="mt-1 font-mono text-2xl font-bold text-up">
            +₹{(flowFeed.inflow || 0).toLocaleString()} <span className="text-xs font-semibold text-muted-foreground">cr</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Capital entering winning sectors
          </span>
        </div>

        {/* Total Outflow */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Institutional Outflow</span>
          <div className="mt-1 font-mono text-2xl font-bold text-down">
            -₹{Math.abs(flowFeed.outflow || 0).toLocaleString()} <span className="text-xs font-semibold text-muted-foreground">cr</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Capital liquidated or hedged
          </span>
        </div>

        {/* Net Flow */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Net Sector Rotation</span>
          <div className="mt-1 font-mono text-2xl font-bold text-brand">
            {flowFeed.netFlow >= 0 ? '+' : ''}₹{(flowFeed.netFlow || 0).toLocaleString()} <span className="text-xs font-semibold text-muted-foreground">cr</span>
          </div>
          <span className="text-[11px] text-up font-mono font-semibold">
            Bullish Net Inflow (+77.4% Absorption)
          </span>
        </div>

        {/* Market Breadth */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Market Breadth</span>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {flowFeed.adv || 229} <span className="text-xs text-up font-bold">Adv</span> : {flowFeed.dec || 267} <span className="text-xs text-down font-bold">Dec</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            {flowFeed.unch || 5} Unchanged Equities
          </span>
        </div>
      </div>

      {/* Sector Capital Rotation Cards Grid */}
      <Card
        title="Sector Capital Rotation &amp; Flow Dynamics"
        icon={Layers}
        info="Real-time institutional capital distribution across 23 sectors. Flow speed and surge tags highlight rapid institutional accumulation."
        legend={
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-up" /> Inflow
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-down" /> Outflow
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Surge
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sectors.map((sec) => {
            const isPositive = (sec.f || 0) >= 0;
            return (
              <div
                key={sec.g}
                onClick={() => setSelectedSector(selectedSector === sec.g ? 'all' : sec.g)}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all shadow-sm flex flex-col justify-between ${
                  selectedSector === sec.g
                    ? 'border-brand bg-brand/10 ring-2 ring-brand/40'
                    : 'border-hairline bg-surface-2 hover:border-brand/40 hover:bg-surface-muted'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading text-sm font-bold text-foreground">
                        {sec.g}
                      </span>
                      {sec.surge && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9.5px] font-bold text-amber-500">
                          <Flame className="h-2.5 w-2.5" />
                          <span>SURGE</span>
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-mono text-xs font-bold ${
                        (sec.p || 0) >= 0 ? 'text-up' : 'text-down'
                      }`}
                    >
                      {(sec.p || 0) >= 0 ? '+' : ''}{(sec.p || 0).toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground font-medium">Net Flow:</span>
                    <span
                      className={`font-mono text-sm font-bold ${
                        isPositive ? 'text-up' : 'text-down'
                      }`}
                    >
                      {isPositive ? '+' : ''}₹{(sec.f || 0).toLocaleString()} cr
                    </span>
                  </div>

                  {/* Flow Dual Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden flex">
                      <div
                        className="h-full bg-up"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(10, ((sec.fin || 0) / ((sec.fin || 1) + Math.abs(sec.fout || 0))) * 100)
                          )}%`
                        }}
                      />
                      <div
                        className="h-full bg-down"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, (Math.abs(sec.fout || 0) / ((sec.fin || 1) + Math.abs(sec.fout || 0))) * 100)
                          )}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                      <span>In: +₹{Math.round(sec.fin || 0).toLocaleString()} cr</span>
                      <span>Out: -₹{Math.round(Math.abs(sec.fout || 0)).toLocaleString()} cr</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-hairline/60 flex items-center justify-between text-[10.5px] text-muted-foreground font-mono">
                  <span>Turnover: ₹{Math.round(sec.tv || 0).toLocaleString()} cr</span>
                  <span className="text-foreground font-semibold">
                    {sec.adv || 0} Adv : {sec.dec || 0} Dec
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Institutional Equities Flow Table Card */}
      <Card
        title={`Institutional Equities Flow Screener (${filteredStocks.length} Stocks)`}
        icon={Activity}
        info="Live institutional capital flow across NSE equities. Relative volume (RV) > 2.0 indicates institutional volume expansion. Close Location Value (CLV) > 0.8 indicates closes near highs of day."
      >
        {/* Search & Filter Toolbar */}
        <div className="space-y-3 pb-3 border-b border-hairline">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search symbol (e.g. ICICIBANK, TITAN, M&M)..."
                className="w-full rounded-xl border border-hairline bg-surface-2 py-1.5 pr-3 pl-8 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand font-medium"
              />
            </div>

            {/* Quick Toggle Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOnlyFo(prev => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all border ${
                  onlyFo
                    ? 'border-brand bg-brand/15 text-brand ring-1 ring-brand/40'
                    : 'border-hairline bg-surface-2 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>F&amp;O Only ({counts.fo})</span>
              </button>

              <button
                onClick={() => setOnlySurge(prev => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all border ${
                  onlySurge
                    ? 'border-amber-500 bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/40'
                    : 'border-hairline bg-surface-2 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flame className="h-3 w-3" />
                <span>⚡ Surges ({counts.surge})</span>
              </button>

              {/* Sector Dropdown */}
              <select
                value={selectedSector}
                onChange={e => setSelectedSector(e.target.value)}
                className="rounded-xl border border-hairline bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-brand cursor-pointer"
              >
                <option value="all">All Sectors ({sectors.length})</option>
                {sectorNames.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-xl border border-hairline bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-brand cursor-pointer"
              >
                <option value="flow">Sort: Net Flow</option>
                <option value="pct">Sort: % Change</option>
                <option value="turnover">Sort: Turnover</option>
                <option value="rv">Sort: Relative Volume</option>
              </select>
            </div>
          </div>

          {/* Buildup Quadrant Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">Buildup:</span>
            {[
              { id: 'all', label: `All (${counts.all})` },
              { id: 'long_buildup', label: `Long Buildup (${counts.lb})`, tone: 'text-up' },
              { id: 'short_covering', label: `Short Covering (${counts.sc})`, tone: 'text-brand' },
              { id: 'short_buildup', label: `Short Buildup (${counts.sb})`, tone: 'text-down' },
              { id: 'long_unwinding', label: `Long Unwinding (${counts.lu})`, tone: 'text-muted-foreground' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedBuildup(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedBuildup === tab.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                } ${tab.tone || ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stocks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-2 text-muted-foreground font-semibold border-b border-hairline text-[11px]">
              <tr>
                <th className="py-2 px-3">Symbol &amp; Company</th>
                <th className="py-2 px-2">Sector</th>
                <th className="py-2 px-2 text-right">LTP (₹)</th>
                <th className="py-2 px-2 text-right">Change</th>
                <th className="py-2 px-3 text-right">Net Flow (₹ Cr)</th>
                <th className="py-2 px-2 text-right">Turnover</th>
                <th className="py-2 px-2 text-center">Rel Vol</th>
                <th className="py-2 px-2 text-center">CLV</th>
                <th className="py-2 px-3">F&amp;O Buildup</th>
                <th className="py-2 px-2 text-center">Speed</th>
                <th className="py-2 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredStocks.slice(0, visibleCount).map((stk) => {
                const isPos = (stk.p || 0) >= 0;
                const isFlowPos = (stk.f || 0) >= 0;

                return (
                  <tr
                    key={stk.s}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                    onClick={() => setActiveChartSymbol({ symbol: stk.s, ltp: stk.lp })}
                  >
                    {/* Symbol & Name */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-foreground text-xs">
                          {stk.s}
                        </span>
                        {stk.fo && (
                          <span className="rounded bg-brand/12 px-1 py-0.2 text-[9px] font-bold text-brand uppercase">
                            F&amp;O
                          </span>
                        )}
                        {stk.surge && (
                          <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                            <Flame className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10.5px] text-muted-foreground truncate block max-w-[170px] font-sans">
                        {stk.n || stk.s}
                      </span>
                    </td>

                    {/* Sector */}
                    <td className="py-2 px-2 text-muted-foreground text-[11px] font-sans">
                      {stk.g || 'Others'}
                    </td>

                    {/* LTP */}
                    <td className="py-2 px-2 text-right font-bold text-foreground">
                      ₹{(stk.lp || 0).toLocaleString()}
                    </td>

                    {/* Change % */}
                    <td
                      className={`py-2 px-2 text-right font-bold ${
                        isPos ? 'text-up' : 'text-down'
                      }`}
                    >
                      {isPos ? '+' : ''}{(stk.p || 0).toFixed(2)}%
                    </td>

                    {/* Net Flow */}
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`font-bold ${
                          isFlowPos ? 'text-up' : 'text-down'
                        }`}
                      >
                        {isFlowPos ? '+' : ''}₹{(stk.f || 0).toLocaleString()} cr
                      </span>
                      {stk.w != null && (
                        <div className="h-1 w-full bg-surface-muted rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${isFlowPos ? 'bg-up' : 'bg-down'}`}
                            style={{ width: `${Math.min(100, Math.max(5, (stk.w || 0.5) * 100))}%` }}
                          />
                        </div>
                      )}
                    </td>

                    {/* Turnover */}
                    <td className="py-2 px-2 text-right text-muted-foreground text-[11px]">
                      ₹{(stk.tv || 0).toLocaleString()} cr
                    </td>

                    {/* Relative Volume (RV) */}
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          (stk.rv || 1) >= 2.0
                            ? 'bg-up/20 text-up font-mono'
                            : (stk.rv || 1) >= 1.2
                            ? 'bg-brand/15 text-brand font-mono'
                            : 'text-muted-foreground font-mono'
                        }`}
                      >
                        {(stk.rv || 1).toFixed(2)}x
                      </span>
                    </td>

                    {/* Close Location Value (CLV) */}
                    <td className="py-2 px-2 text-center">
                      <span
                        className={`text-[10px] font-bold ${
                          (stk.clv || 0) >= 0.8
                            ? 'text-up'
                            : (stk.clv || 0) <= 0.2
                            ? 'text-down'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {stk.clv != null ? stk.clv.toFixed(2) : '—'}
                      </span>
                    </td>

                    {/* F&O Buildup */}
                    <td className="py-2 px-3">
                      {stk.bu ? (
                        <div className="flex flex-col">
                          <span
                            className={`text-[11px] font-bold ${
                              stk.bu.toLowerCase().includes('long buildup')
                                ? 'text-up'
                                : stk.bu.toLowerCase().includes('short covering')
                                ? 'text-brand'
                                : stk.bu.toLowerCase().includes('short buildup')
                                ? 'text-down'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {stk.bu}
                          </span>
                          {stk.doi != null && (
                            <span className="text-[10px] text-muted-foreground">
                              Δ-OI: {stk.doi > 0 ? '+' : ''}{stk.doi}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">Equity Cash</span>
                      )}
                    </td>

                    {/* Speed */}
                    <td className="py-2 px-2 text-center text-muted-foreground text-[11px]">
                      {stk.spd != null ? `${stk.spd}x` : '—'}
                    </td>

                    {/* Action */}
                    <td className="py-2 px-2 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setActiveChartSymbol({ symbol: stk.s, ltp: stk.lp })}
                          className="p-1 rounded text-muted-foreground hover:text-brand hover:bg-surface-muted transition-colors"
                          title="Interactive Chart"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                        </button>
                        {stk.fo && (
                          <button
                            onClick={() => {
                              setSelectedOptionSymbol(stk.s);
                              setCurrentScreen('options');
                            }}
                            className="p-1 rounded text-muted-foreground hover:text-brand hover:bg-surface-muted transition-colors"
                            title="Option Chain"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {filteredStocks.length > visibleCount && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 50)}
              className="rounded-xl border border-hairline bg-surface-2 px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-muted transition-colors"
            >
              Load More Stocks ({filteredStocks.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

