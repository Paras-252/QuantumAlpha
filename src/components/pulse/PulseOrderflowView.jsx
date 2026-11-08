import React, { useState, useMemo } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import Card from '../common/Card';
import Badge from '../common/Badge';
import {
  Activity,
  Layers,
  Search,
  Zap,
  Filter,
  BarChart2,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Compass,
  Sliders,
  ShieldCheck,
  Target
} from 'lucide-react';

export default function PulseOrderflowView() {
  const {
    orderflowFeed,
    marketStatus,
    marketSubtext,
    setActiveChartSymbol,
    setSelectedOptionSymbol,
    setCurrentScreen
  } = useMarketData();

  const [searchQuery, setSearchQuery] = useState('');
  const [pocFilter, setPocFilter] = useState('all'); // 'all' | 'above_poc' | 'below_poc'
  const [buyerFilter, setBuyerFilter] = useState('all'); // 'all' | 'strong_buyers' | 'strong_sellers'
  const [selectedSector, setSelectedSector] = useState('all');
  const [sortBy, setSortBy] = useState('turnover'); // 'turnover' | 'cvd' | 'buy_pct' | 'chg'
  const [visibleCount, setVisibleCount] = useState(40);

  const stocks = useMemo(() => {
    return orderflowFeed.stocks || [];
  }, [orderflowFeed.stocks]);

  // Unique sector list
  const sectorList = useMemo(() => {
    const s = new Set();
    stocks.forEach(stk => {
      if (stk.sector) s.add(stk.sector);
    });
    return Array.from(s).sort();
  }, [stocks]);

  // Macro Orderflow Aggregate Stats
  const macroStats = useMemo(() => {
    let totalCvd = 0;
    let buyPctSum = 0;
    let abovePocCount = 0;
    let aboveVwapCount = 0;
    let bullBooks = 0;
    let bearBooks = 0;

    stocks.forEach(s => {
      totalCvd += s.cvd || 0;
      buyPctSum += s.buy_pct || 50;
      if (s.poc && s.ltp >= s.poc) abovePocCount++;
      if (s.vwap && s.ltp >= s.vwap) aboveVwapCount++;
      if (s.ob?.bull > (s.ob?.bear || 0)) bullBooks++;
      else if ((s.ob?.bear || 0) > (s.ob?.bull || 0)) bearBooks++;
    });

    const total = stocks.length || 1;
    return {
      total,
      totalCvd,
      avgBuyPct: (buyPctSum / total).toFixed(1),
      abovePocPct: Math.round((abovePocCount / total) * 100),
      aboveVwapPct: Math.round((aboveVwapCount / total) * 100),
      bullBooks,
      bearBooks
    };
  }, [stocks]);

  // Filtered stocks list
  const filteredStocks = useMemo(() => {
    return stocks.filter(s => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        s.symbol.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.sector && s.sector.toLowerCase().includes(q));

      // POC filter
      if (pocFilter === 'above_poc' && (!s.poc || s.ltp < s.poc)) return false;
      if (pocFilter === 'below_poc' && (!s.poc || s.ltp >= s.poc)) return false;

      // Buyer filter
      if (buyerFilter === 'strong_buyers' && (s.buy_pct || 0) < 55) return false;
      if (buyerFilter === 'strong_sellers' && (s.buy_pct || 0) > 47) return false;

      // Sector filter
      if (selectedSector !== 'all' && s.sector !== selectedSector) return false;

      return matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'turnover') return (b.tv || 0) - (a.tv || 0);
      if (sortBy === 'cvd') return Math.abs(b.cvd || 0) - Math.abs(a.cvd || 0);
      if (sortBy === 'buy_pct') return (b.buy_pct || 0) - (a.buy_pct || 0);
      if (sortBy === 'chg') return (b.chg_pct || 0) - (a.chg_pct || 0);
      return 0;
    });
  }, [stocks, searchQuery, pocFilter, buyerFilter, selectedSector, sortBy]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-up animate-ping" />
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                Orderflow &amp; Market Depth (Level 2/3)
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground font-mono">
                {orderflowFeed.ts || '15:31:29 IST'} · {orderflowFeed.candle_min || 3}-min resolution
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Orderflow, CVD &amp; Volume Profile (POC/VAH/VAL)
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Multi-shard orderflow delta tracking, Point of Control fair-value magnets, and top-5 market depth imbalances across {stocks.length} F&amp;O symbols.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="live" dot>
              {marketStatus === 'Live' ? 'Live Orderflow Delta' : 'Orderflow Session: FROZEN'}
            </Badge>
          </div>
        </div>

        {/* Data Sources Disclaimer & Pipeline */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 rounded-xl border border-hairline/70 bg-surface-2 px-3.5 py-2 text-xs text-muted-foreground font-mono">
          <span className="font-bold text-foreground">Feeds:</span>
          {(orderflowFeed.sources || []).map((src, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-surface-card px-2 py-0.5 rounded border border-hairline text-[10.5px]">
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* 4 Macro Orderflow Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Net CVD */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Net Cumulative Delta (CVD)</span>
          <div className="mt-1 font-mono text-2xl font-bold text-up">
            {macroStats.totalCvd >= 0 ? '+' : ''}{(macroStats.totalCvd / 1000000).toFixed(2)}M <span className="text-xs font-semibold text-muted-foreground">contracts</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Aggressive Market Order Absorption
          </span>
        </div>

        {/* Average Buy Dominance */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Buyer Volume Ratio</span>
          <div className="mt-1 font-mono text-2xl font-bold text-brand">
            {macroStats.avgBuyPct}% <span className="text-xs font-semibold text-muted-foreground">Buy Pressure</span>
          </div>
          <span className="text-[11px] text-up font-mono font-semibold">
            Aggressive bid lifting dominance
          </span>
        </div>

        {/* Above POC (Value Area Health) */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Trading Above Fair Value (POC)</span>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {macroStats.abovePocPct}% <span className="text-xs font-semibold text-muted-foreground">of F&amp;O</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Value Acceptance above session Point of Control
          </span>
        </div>

        {/* Institutional Order Book Defenses */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Order Book Imbalance</span>
          <div className="mt-1 font-mono text-2xl font-bold text-up">
            {macroStats.bullBooks} Bull <span className="text-xs font-semibold text-muted-foreground">: {macroStats.bearBooks} Bear</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Top-5 Depth Bids vs Asks Ratio
          </span>
        </div>
      </div>

      {/* Main Orderflow Table & Profile Screener */}
      <Card
        title={`Orderflow & Volume Profile Screener (${filteredStocks.length} F&O Instruments)`}
        icon={Target}
        info="POC = Point of Control (Highest Volume Price). VAH = Value Area High (70% Volume Top). VAL = Value Area Low (70% Volume Bottom). CVD = Cumulative Volume Delta (Market Buys - Market Sells)."
      >
        {/* Toolbar & Filters */}
        <div className="space-y-3 pb-3 border-b border-hairline">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search symbol (e.g. HDFCBANK, ICICIBANK, ABB)..."
                className="w-full rounded-xl border border-hairline bg-surface-2 py-1.5 pr-3 pl-8 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand font-medium"
              />
            </div>

            {/* Quick Filter Selects */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sector Dropdown */}
              <select
                value={selectedSector}
                onChange={e => setSelectedSector(e.target.value)}
                className="rounded-xl border border-hairline bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-brand cursor-pointer"
              >
                <option value="all">All Sectors ({sectorList.length})</option>
                {sectorList.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-xl border border-hairline bg-surface-2 px-2.5 py-1 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-brand cursor-pointer"
              >
                <option value="turnover">Sort: Turnover</option>
                <option value="cvd">Sort: Cumulative Delta (CVD)</option>
                <option value="buy_pct">Sort: Buyer %</option>
                <option value="chg">Sort: % Change</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">POC Position:</span>
            {[
              { id: 'all', label: 'All Instruments' },
              { id: 'above_poc', label: 'Trading Above POC (Bullish Acceptance)', tone: 'text-up' },
              { id: 'below_poc', label: 'Trading Below POC (Value Rejection)', tone: 'text-down' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPocFilter(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  pocFilter === tab.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                } ${tab.tone || ''}`}
              >
                {tab.label}
              </button>
            ))}

            <span className="text-muted-foreground mx-1">|</span>

            <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">Aggression:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'strong_buyers', label: 'Buyers > 55%', tone: 'text-up' },
              { id: 'strong_sellers', label: 'Sellers > 53%', tone: 'text-down' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setBuyerFilter(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  buyerFilter === tab.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-surface-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                } ${tab.tone || ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orderflow Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-2 text-muted-foreground font-semibold border-b border-hairline text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Symbol &amp; Sector</th>
                <th className="py-2.5 px-2 text-right">LTP (₹)</th>
                <th className="py-2.5 px-2 text-right">Change</th>
                <th className="py-2.5 px-4 min-w-[220px]">Value Area (VAL · POC · VAH)</th>
                <th className="py-2.5 px-2 text-right">VWAP</th>
                <th className="py-2.5 px-3 min-w-[150px]">CVD &amp; Buy %</th>
                <th className="py-2.5 px-3">Institutional Levels (S/R)</th>
                <th className="py-2.5 px-2 text-center">Depth Book</th>
                <th className="py-2.5 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredStocks.slice(0, visibleCount).map((stk) => {
                const isPos = (stk.chg_pct || 0) >= 0;
                const isAbovePoc = stk.poc && stk.ltp >= stk.poc;
                const isAboveVwap = stk.vwap && stk.ltp >= stk.vwap;
                const isCvdPos = (stk.cvd || 0) >= 0;

                // Value area range positioning
                const val = stk.val || stk.ltp * 0.98;
                const vah = stk.vah || stk.ltp * 1.02;
                const poc = stk.poc || (val + vah) / 2;
                const rangeSpan = Math.max(vah - val, 1);
                const ltpPos = Math.min(100, Math.max(0, ((stk.ltp - val) / rangeSpan) * 100));
                const pocPos = Math.min(100, Math.max(0, ((poc - val) / rangeSpan) * 100));

                return (
                  <tr
                    key={stk.symbol}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                    onClick={() => setActiveChartSymbol({ symbol: stk.symbol, ltp: stk.ltp })}
                  >
                    {/* Symbol & Sector */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-foreground text-xs">
                          {stk.symbol}
                        </span>
                        <span className="rounded bg-brand/12 px-1 py-0.2 text-[9px] font-bold text-brand uppercase">
                          F&amp;O
                        </span>
                      </div>
                      <span className="text-[10.5px] text-muted-foreground truncate block max-w-[180px] font-sans">
                        {stk.sector || stk.name}
                      </span>
                    </td>

                    {/* LTP */}
                    <td className="py-2.5 px-2 text-right font-bold text-foreground">
                      ₹{(stk.ltp || 0).toLocaleString()}
                    </td>

                    {/* Change % */}
                    <td
                      className={`py-2.5 px-2 text-right font-bold ${
                        isPos ? 'text-up' : 'text-down'
                      }`}
                    >
                      {isPos ? '+' : ''}{(stk.chg_pct || 0).toFixed(2)}%
                    </td>

                    {/* Value Area Profile Bar */}
                    <td className="py-2.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                          <span>VAL: ₹{val.toFixed(1)}</span>
                          <span className={`font-bold ${isAbovePoc ? 'text-up' : 'text-down'}`}>
                            POC: ₹{poc.toFixed(1)}
                          </span>
                          <span>VAH: ₹{vah.toFixed(1)}</span>
                        </div>

                        {/* Interactive Range Gauge */}
                        <div className="relative h-2 w-full rounded-full bg-surface-muted overflow-visible flex items-center">
                          {/* 70% Value Area Band */}
                          <div className="absolute inset-0 rounded-full bg-brand/20 border border-brand/30" />

                          {/* POC Marker Tick */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-amber-500 rounded z-10"
                            style={{ left: `${pocPos}%` }}
                            title={`Point of Control (POC): ₹${poc}`}
                          />

                          {/* Current Price Dot */}
                          <div
                            className={`absolute h-3 w-3 rounded-full border-2 border-surface shadow-md -translate-x-1/2 z-20 ${
                              isAbovePoc ? 'bg-up' : 'bg-down'
                            }`}
                            style={{ left: `${ltpPos}%` }}
                            title={`Current Price: ₹${stk.ltp} (${isAbovePoc ? 'Above POC' : 'Below POC'})`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* VWAP */}
                    <td className="py-2.5 px-2 text-right">
                      <div className="font-bold text-foreground">
                        ₹{(stk.vwap || 0).toLocaleString()}
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          isAboveVwap ? 'text-up' : 'text-down'
                        }`}
                      >
                        {isAboveVwap ? '+' : ''}{(((stk.ltp - stk.vwap) / (stk.vwap || 1)) * 100).toFixed(2)}%
                      </span>
                    </td>

                    {/* CVD & Buy % */}
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span
                            className={`font-bold ${
                              isCvdPos ? 'text-up' : 'text-down'
                            }`}
                          >
                            {isCvdPos ? '+' : ''}{(stk.cvd || 0).toLocaleString()} CVD
                          </span>
                          <span className="font-bold text-foreground">
                            {stk.buy_pct || 50}% Buy
                          </span>
                        </div>

                        {/* Dual Buy/Sell Bar */}
                        <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden flex">
                          <div
                            className="h-full bg-up"
                            style={{ width: `${stk.buy_pct || 50}%` }}
                          />
                          <div
                            className="h-full bg-down"
                            style={{ width: `${100 - (stk.buy_pct || 50)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Institutional S/R Levels */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap items-center gap-1 max-w-[190px]">
                        {(stk.levels || []).slice(0, 3).map((lvl, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              lvl.kind === 's'
                                ? 'bg-up/12 text-up border border-up/30'
                                : 'bg-down/12 text-down border border-down/30'
                            }`}
                            title={`${lvl.label}: ₹${lvl.price}`}
                          >
                            {lvl.label}: {Math.round(lvl.price)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Depth Order Book */}
                    <td className="py-2.5 px-2 text-center">
                      {stk.ob ? (
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            stk.ob.bull > (stk.ob.bear || 0)
                              ? 'bg-up/15 text-up'
                              : 'bg-down/15 text-down'
                          }`}
                        >
                          {stk.ob.bull}B : {stk.ob.bear || 0}S
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-2 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setActiveChartSymbol({ symbol: stk.symbol, ltp: stk.ltp })}
                          className="p-1 rounded text-muted-foreground hover:text-brand hover:bg-surface-muted transition-colors"
                          title="Interactive Chart"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOptionSymbol(stk.symbol);
                            setCurrentScreen('options');
                          }}
                          className="p-1 rounded text-muted-foreground hover:text-brand hover:bg-surface-muted transition-colors"
                          title="Option Chain"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
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
              onClick={() => setVisibleCount(prev => prev + 40)}
              className="rounded-xl border border-hairline bg-surface-2 px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-muted transition-colors"
            >
              Load More Instruments ({filteredStocks.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

