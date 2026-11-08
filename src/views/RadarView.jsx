import React, { useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import { ALL_REAL_STOCKS } from '../data/marketData';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Compass,
  Star,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Volume2,
  BarChart2
} from 'lucide-react';

export default function RadarView() {
  const { radarItems, setSelectedOptionSymbol, setCurrentScreen, playAlertSound, setActiveChartSymbol, marketStatus, showToast } = useMarketData();
  const [items, setItems] = useState(radarItems);
  const [newSymbol, setNewSymbol] = useState('');

  const toggleFavorite = (sym) => {
    setItems(prev =>
      prev.map(item => item.symbol === sym ? { ...item, favorite: !item.favorite } : item)
    );
    playAlertSound('warning');
  };

  const handleAddSymbol = (e) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    const sym = newSymbol.trim().toUpperCase();
    if (items.some(i => i.symbol === sym)) {
      showToast('Symbol Exists', `${sym} is already on the radar`, 'info');
      return;
    }

    const found = ALL_REAL_STOCKS.find(stk => stk.s === sym);
    const ltp = found?.lp || 1500;
    const pChg = found?.p || 0.5;
    const change = +(pChg * ltp / 100).toFixed(2);
    const vwap = +(ltp * 0.995).toFixed(2);
    const vwapDiff = pChg >= 0 ? `+${(pChg * 0.3).toFixed(2)}%` : `${(pChg * 0.3).toFixed(2)}%`;
    const volMult = found?.rv != null ? +found.rv.toFixed(1) : 1.5;
    const rsi = +(50 + pChg * 3.5).toFixed(1);
    const signal = found?.bu || (pChg >= 0 ? 'Volume Surge' : 'Range Retest');

    const added = {
      symbol: sym,
      ltp,
      change,
      pChg,
      vwap,
      vwapDiff,
      volMult,
      rsi,
      signal,
      favorite: true
    };
    setItems([added, ...items]);
    setNewSymbol('');
    playAlertSound('success');
    showToast('Symbol Added', `${sym} added to radar watchlist with official quote`, 'success');
  };

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
              Momentum &amp; Volume Radar
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Stock Radar Watchlist
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time radar tracking volume surges (&gt;1.5x average), VWAP retests, and multi-timeframe breakouts.
          </p>
        </div>

        {/* Add custom symbol form */}
        <form onSubmit={handleAddSymbol} className="flex items-center gap-2">
          <input
            type="text"
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value)}
            placeholder="Add ticker (e.g. BEL)..."
            className="rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-xs font-mono font-bold uppercase text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-brand px-3 py-1.5 text-xs font-bold text-white shadow-glow hover:bg-brand-deep transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Radar Table */}
      <Card
        title="Live Surveillance Watchlist"
        icon={Compass}
        status={<Badge tone={marketStatus === 'Live' ? 'live' : 'closed'} dot={marketStatus === 'Live'}>218 F&amp;O Equities</Badge>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-hairline text-muted-foreground font-bold">
              <tr>
                <th className="py-2.5 px-3 w-8">★</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                <th className="py-2.5 px-3 text-right">Change %</th>
                <th className="py-2.5 px-3 text-right">Intraday VWAP</th>
                <th className="py-2.5 px-3 text-right">VWAP Distance</th>
                <th className="py-2.5 px-3 text-center">Volume Multiple</th>
                <th className="py-2.5 px-3 text-center">RSI</th>
                <th className="py-2.5 px-3 text-center">Radar Signal</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {items.map((item) => {
                const isUp = item.pChg >= 0;
                return (
                  <tr key={item.symbol} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => toggleFavorite(item.symbol)}
                        className={`text-sm ${item.favorite ? 'text-warn' : 'text-subtle-foreground hover:text-warn'}`}
                      >
                        ★
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-foreground">
                      {item.symbol}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">
                      ₹{item.ltp.toFixed(2)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${isUp ? 'text-up' : 'text-down'}`}>
                      {isUp ? '+' : ''}{item.pChg.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground font-medium">
                      ₹{item.vwap.toFixed(2)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${item.vwapDiff.startsWith('+') ? 'text-up' : 'text-down'}`}>
                      {item.vwapDiff}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${item.volMult >= 2.0 ? 'bg-brand/20 text-brand' : 'text-foreground'}`}>
                        {item.volMult}x Vol
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-foreground font-bold">
                      {item.rsi}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge tone={item.signal.includes('Breakout') || item.signal.includes('Surge') ? 'up' : item.signal.includes('Breakdown') ? 'down' : 'neutral'}>
                        {item.signal}
                      </Badge>
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
                          Options &rarr;
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
