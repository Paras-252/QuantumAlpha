import React, { useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Filter,
  TrendingUp,
  Percent,
  Layers,
  Activity,
  Sliders,
  Search,
  BarChart2
} from 'lucide-react';

export default function ScreenersView() {
  const { screeners, setSelectedOptionSymbol, setCurrentScreen, setActiveChartSymbol } = useMarketData();
  const [activeTab, setActiveTab] = useState('basis'); // 'basis' | 'rsi' | 'iv'

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
              Quantitative Derivatives Screeners
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Technical &amp; Options Screeners
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Filter anomalies in futures basis yields, multi-timeframe RSI momentum, and implied volatility ranks.
          </p>
        </div>

        {/* Tab switcher buttons matching Tredye */}
        <div className="flex items-center gap-1 rounded-xl bg-surface-2 p-1 border border-hairline">
          <button
            onClick={() => setActiveTab('basis')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'basis'
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Futures Basis
          </button>
          <button
            onClick={() => setActiveTab('rsi')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'rsi'
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            RSI Multi-Timeframe
          </button>
          <button
            onClick={() => setActiveTab('iv')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'iv'
                ? 'bg-brand text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            IV Screener
          </button>
        </div>
      </div>

      {/* Screeners Content based on Active Tab */}
      {activeTab === 'basis' && (
        <Card
          title="Futures Basis Screener (Cash-Carry Yields)"
          icon={Percent}
          info="Futures Basis = Futures Price minus Cash Spot Price. High positive basis yields attractive cash-carry arbitrage returns; negative basis (discount) indicates heavy short positioning or upcoming dividend."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-hairline text-muted-foreground font-bold">
                <tr>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3 text-right">Cash Spot (₹)</th>
                  <th className="py-2.5 px-3 text-right">Near Fut (₹)</th>
                  <th className="py-2.5 px-3 text-right">Basis (Pts)</th>
                  <th className="py-2.5 px-3 text-right">Basis %</th>
                  <th className="py-2.5 px-3 text-right">Annualized Yield</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {screeners.basis.map((item) => {
                  const isPremium = item.basis >= 0;
                  return (
                    <tr key={item.symbol} className="hover:bg-surface-2 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-foreground">{item.symbol}</td>
                      <td className="py-2.5 px-3 text-right text-foreground">₹{item.spot.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-foreground">₹{item.fut.toFixed(2)}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isPremium ? 'text-up' : 'text-down'}`}>
                        {isPremium ? '+' : ''}{item.basis.toFixed(2)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isPremium ? 'text-up' : 'text-down'}`}>
                        {isPremium ? '+' : ''}{item.basisPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-brand">
                        {item.annYield.toFixed(2)}% p.a.
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveChartSymbol({ symbol: item.symbol, ltp: item.spot })}
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
      )}

      {activeTab === 'rsi' && (
        <Card
          title="Multi-Timeframe RSI Momentum Screener"
          icon={Activity}
          info="Monitors RSI across 15-minute, 1-hour, Daily, and Weekly timeframes. Look for multi-timeframe alignment (>60 for strong momentum, <40 for weakness, <30 for oversold)."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-hairline text-muted-foreground font-bold">
                <tr>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                  <th className="py-2.5 px-3 text-center">15m RSI</th>
                  <th className="py-2.5 px-3 text-center">1h RSI</th>
                  <th className="py-2.5 px-3 text-center">Daily RSI</th>
                  <th className="py-2.5 px-3 text-center">Weekly RSI</th>
                  <th className="py-2.5 px-3 text-center">Trend Signal</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {screeners.rsi.map((item) => (
                  <tr key={item.symbol} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-foreground">{item.symbol}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">₹{item.ltp.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        item.rsi15m >= 70 ? 'bg-up/20 text-up' : item.rsi15m <= 30 ? 'bg-down/20 text-down' : 'text-foreground'
                      }`}>
                        {item.rsi15m}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        item.rsi1h >= 70 ? 'bg-up/20 text-up' : item.rsi1h <= 30 ? 'bg-down/20 text-down' : 'text-foreground'
                      }`}>
                        {item.rsi1h}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        item.rsiDaily >= 70 ? 'bg-up/20 text-up' : item.rsiDaily <= 30 ? 'bg-down/20 text-down' : 'text-foreground'
                      }`}>
                        {item.rsiDaily}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">{item.rsiWeekly}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge tone={item.trend.includes('Bullish') ? 'up' : item.trend.includes('Oversold') ? 'down' : 'neutral'}>
                        {item.trend}
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
                          Option Chain &rarr;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'iv' && (
        <Card
          title="Implied Volatility (IV) Rank &amp; Percentile Screener"
          icon={Sliders}
          info="Identifies rich vs cheap options: IV Rank > 80 indicates elevated volatility (ideal for option selling like iron condors/strangles); IV Rank < 20 indicates cheap options (ideal for directional option buying)."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-hairline text-muted-foreground font-bold">
                <tr>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3 text-right">LTP (₹)</th>
                  <th className="py-2.5 px-3 text-right">Current IV</th>
                  <th className="py-2.5 px-3 text-center">IV Rank</th>
                  <th className="py-2.5 px-3 text-center">IV Percentile</th>
                  <th className="py-2.5 px-3 text-right">30D Realized HV</th>
                  <th className="py-2.5 px-3 text-center">Trading Strategy Bias</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {screeners.iv.map((item) => (
                  <tr key={item.symbol} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-foreground">{item.symbol}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">₹{item.ltp.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">{item.currentIV}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        item.ivRank >= 75 ? 'bg-warn/20 text-warn' : item.ivRank <= 25 ? 'bg-up/20 text-up' : 'text-foreground'
                      }`}>
                        {item.ivRank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-foreground">{item.ivPctile}%ile</td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground font-medium">{item.hv30}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge tone={item.ivRank >= 75 ? 'warn' : 'up'}>
                        {item.bias}
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
                          Option Chain &rarr;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
