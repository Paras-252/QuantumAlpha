import React from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Droplets,
  Layers,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  BarChart2
} from 'lucide-react';

export default function LiquidityView() {
  const { liquidityTrades, radarItems, setCurrentScreen, setSelectedOptionSymbol, setActiveChartSymbol, marketStatus } = useMarketData();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
            <span className="text-xs font-bold text-brand tracking-wider uppercase">
              Microstructure &amp; Order Depth
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Liquidity Map &amp; Block Flow
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Detect large institutional block orders, buyer aggression, and bid/ask depth walls across NSE equities.
          </p>
        </div>

        <Badge tone={marketStatus === 'Live' ? 'live' : 'closed'} dot={marketStatus === 'Live'}>
          {marketStatus === 'Live' ? 'Live Depth Stream' : 'Closing Session Blocks'}
        </Badge>
      </div>

      {/* Grid: Live Block Deals & VWAP Bands */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Large Institutional Trades (lg:col-span-7) */}
        <Card
          className="lg:col-span-7"
          title="Large Trade Feed (Blocks &gt; ₹3 Cr)"
          icon={Droplets}
          info="Identifies institutional block trades executed at market ask (buyer lift) or bid (seller dump)."
          status={<Badge tone="sim">Exchange Tape</Badge>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-hairline text-muted-foreground font-bold">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Execution</th>
                  <th className="py-2.5 px-3 text-right">Value (Cr)</th>
                  <th className="py-2.5 px-3 text-right">Aggression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {liquidityTrades.map((t, idx) => (
                  <tr key={idx} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2 px-3 text-muted-foreground">{t.time}</td>
                    <td className="py-2 px-3 font-bold text-foreground flex items-center gap-1.5">
                      <span>{t.symbol}</span>
                      <button
                        onClick={() => setActiveChartSymbol({ symbol: t.symbol, ltp: t.price })}
                        className="text-subtle-foreground hover:text-brand"
                      >
                        <BarChart2 className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        t.type === 'BUY' ? 'text-up' : 'text-down'
                      }`}>
                        {t.type === 'BUY' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-foreground">
                      {t.qty.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-foreground">
                      ₹{t.price.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-brand">
                      ₹{t.valueCr} Cr
                    </td>
                    <td className="py-2 px-3 text-right text-muted-foreground font-medium">
                      {t.aggression}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* VWAP Deviation & Order Flow Imbalance (lg:col-span-5) */}
        <Card
          className="lg:col-span-5"
          title="VWAP Deviation &amp; Pullback Pressure"
          icon={Activity}
          info="Measures how far key stocks have stretched above or below their intraday Volume Weighted Average Price (VWAP)."
        >
          <div className="space-y-3 font-mono text-xs">
            {radarItems.slice(0, 5).map((item) => {
              const isAbove = item.vwapDiff.startsWith('+');
              return (
                <div key={item.symbol} className="rounded-xl border border-hairline bg-surface-2 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground">{item.symbol}</span>
                    <span className={`font-bold ${isAbove ? 'text-up' : 'text-down'}`}>
                      {item.vwapDiff} from VWAP
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                    <span>LTP: ₹{item.ltp.toFixed(2)}</span>
                    <span>VWAP: ₹{item.vwap.toFixed(2)}</span>
                  </div>

                  <div className="mt-2 h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isAbove ? 'bg-up' : 'bg-down'}`}
                      style={{ width: `${Math.min(100, Math.abs(parseFloat(item.vwapDiff)) * 40)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
