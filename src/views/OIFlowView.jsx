import React, { useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  BarChart2
} from 'lucide-react';

export default function OIFlowView() {
  const { oiFlowData, setCurrentScreen, setSelectedOptionSymbol, setActiveChartSymbol } = useMarketData();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = {
    all: oiFlowData.length,
    long_buildup: oiFlowData.filter(d => d.category === 'long_buildup').length,
    short_covering: oiFlowData.filter(d => d.category === 'short_covering').length,
    short_buildup: oiFlowData.filter(d => d.category === 'short_buildup').length,
    long_unwinding: oiFlowData.filter(d => d.category === 'long_unwinding').length,
  };

  const filtered = oiFlowData.filter(item => {
    const matchesFilter = selectedFilter === 'all' || item.category === selectedFilter;
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenOption = (sym) => {
    setSelectedOptionSymbol(sym);
    setCurrentScreen('options');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
            <span className="text-xs font-bold text-brand tracking-wider uppercase">
              F&amp;O Derivatives Intelligence
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Open Interest (OI) Flow Quadrants
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track smart money accumulation, short traps, short covering rallies and profit taking across 218 F&amp;O stocks.
          </p>
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter symbol or sector..."
            className="rounded-xl border border-hairline bg-surface-2 py-1.5 pr-3 pl-8 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand font-medium"
          />
        </div>
      </div>

      {/* 4 Quadrant Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Long Build-up */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'long_buildup' ? 'all' : 'long_buildup')}
          className={`flex flex-col text-left rounded-2xl border p-4 transition-all shadow-card ${
            selectedFilter === 'long_buildup'
              ? 'border-up bg-up/15 ring-2 ring-up/40'
              : 'border-hairline bg-surface-card hover:border-up/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-up">Long Build-up</span>
            <span className="rounded-md bg-up/20 px-2 py-0.5 font-mono text-xs font-bold text-up">
              {counts.long_buildup}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground font-medium">
            Price <strong className="text-up font-bold">&uarr;</strong> · OI <strong className="text-up font-bold">&uarr;</strong>
          </div>
          <p className="text-[10px] text-subtle-foreground mt-1">Aggressive Institutional Buying</p>
        </button>

        {/* Short Covering */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'short_covering' ? 'all' : 'short_covering')}
          className={`flex flex-col text-left rounded-2xl border p-4 transition-all shadow-card ${
            selectedFilter === 'short_covering'
              ? 'border-brand bg-brand/15 ring-2 ring-brand/40'
              : 'border-hairline bg-surface-card hover:border-brand/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand">Short Covering</span>
            <span className="rounded-md bg-brand/20 px-2 py-0.5 font-mono text-xs font-bold text-brand">
              {counts.short_covering}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground font-medium">
            Price <strong className="text-up font-bold">&uarr;</strong> · OI <strong className="text-down font-bold">&darr;</strong>
          </div>
          <p className="text-[10px] text-subtle-foreground mt-1">Bears Forced to Close Shorts</p>
        </button>

        {/* Short Build-up */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'short_buildup' ? 'all' : 'short_buildup')}
          className={`flex flex-col text-left rounded-2xl border p-4 transition-all shadow-card ${
            selectedFilter === 'short_buildup'
              ? 'border-down bg-down/15 ring-2 ring-down/40'
              : 'border-hairline bg-surface-card hover:border-down/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-down">Short Build-up</span>
            <span className="rounded-md bg-down/20 px-2 py-0.5 font-mono text-xs font-bold text-down">
              {counts.short_buildup}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground font-medium">
            Price <strong className="text-down font-bold">&darr;</strong> · OI <strong className="text-up font-bold">&uarr;</strong>
          </div>
          <p className="text-[10px] text-subtle-foreground mt-1">Fresh Bearish Short Pressure</p>
        </button>

        {/* Long Unwinding */}
        <button
          onClick={() => setSelectedFilter(selectedFilter === 'long_unwinding' ? 'all' : 'long_unwinding')}
          className={`flex flex-col text-left rounded-2xl border p-4 transition-all shadow-card ${
            selectedFilter === 'long_unwinding'
              ? 'border-warn bg-warn/15 ring-2 ring-warn/40'
              : 'border-hairline bg-surface-card hover:border-warn/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-warn">Long Unwinding</span>
            <span className="rounded-md bg-warn/20 px-2 py-0.5 font-mono text-xs font-bold text-warn">
              {counts.long_unwinding}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground font-medium">
            Price <strong className="text-down font-bold">&darr;</strong> · OI <strong className="text-down font-bold">&darr;</strong>
          </div>
          <p className="text-[10px] text-subtle-foreground mt-1">Bulls Booking Realized Profits</p>
        </button>
      </div>

      {/* Table Card */}
      <Card
        title={`OI Flow Stock Breakdown (${filtered.length} symbols)`}
        icon={Layers}
        actions={
          selectedFilter !== 'all' && (
            <button
              onClick={() => setSelectedFilter('all')}
              className="text-xs text-brand hover:underline font-bold"
            >
              Reset Filter
            </button>
          )
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-hairline text-muted-foreground font-bold">
              <tr>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                <th className="py-2.5 px-3 text-right">Price Chg%</th>
                <th className="py-2.5 px-3 text-right">Open Interest</th>
                <th className="py-2.5 px-3 text-right">OI Chg%</th>
                <th className="py-2.5 px-3 text-center">Quadrant Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map(item => {
                const isPriceUp = item.pChg >= 0;
                const isOiUp = item.oiChgPct >= 0;

                const tone =
                  item.category === 'long_buildup'
                    ? 'up'
                    : item.category === 'short_covering'
                    ? 'sim'
                    : item.category === 'short_buildup'
                    ? 'down'
                    : 'warn';

                return (
                  <tr key={item.symbol} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-foreground">
                      {item.symbol}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">
                      {item.sector}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">
                      ₹{item.ltp.toFixed(2)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${isPriceUp ? 'text-up' : 'text-down'}`}>
                      {isPriceUp ? '+' : ''}{item.pChg.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-foreground font-medium">
                      {(item.oi / 100000).toFixed(2)} L
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${isOiUp ? 'text-up' : 'text-down'}`}>
                      {isOiUp ? '+' : ''}{item.oiChgPct.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge tone={tone}>{item.status}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveChartSymbol({ symbol: item.symbol, ltp: item.ltp })}
                          className="rounded-lg bg-surface-2 px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                          title="View Chart"
                        >
                          <BarChart2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleOpenOption(item.symbol)}
                          className="rounded-lg bg-surface-muted px-2 py-1 text-[11px] font-bold text-brand hover:bg-brand hover:text-white transition-colors"
                        >
                          Option Chain &rarr;
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
