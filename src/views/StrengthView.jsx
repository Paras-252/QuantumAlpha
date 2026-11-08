import React from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Compass
} from 'lucide-react';

export default function StrengthView() {
  const { sectors, indices, setCurrentScreen, marketStatus } = useMarketData();

  // Nifty benchmark return (derived from real closing Nifty return)
  const niftyP = indices && indices[0] ? indices[0].pChange : 2.01;
  const sectorsWithRS = sectors.map(s => ({
    ...s,
    rs: +(s.p - niftyP).toFixed(2),
    quadrant:
      s.p > niftyP && s.flow > 0
        ? 'Leading'
        : s.p <= niftyP && s.flow > 0
        ? 'Improving'
        : s.p > niftyP && s.flow <= 0
        ? 'Weakening'
        : 'Lagging'
  })).sort((a, b) => b.rs - a.rs);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
            <span className="text-xs font-bold text-brand tracking-wider uppercase">
              Relative Rotation &amp; Outperformance
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Sector &amp; Stock Strength Boards
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Compare every sector against the benchmark NIFTY 50 ({niftyP >= 0 ? '+' : ''}{niftyP}%) to focus on alpha leaders.
          </p>
        </div>

        <Badge tone={marketStatus === 'Live' ? 'live' : 'closed'}>Benchmark: NIFTY 50 ({niftyP >= 0 ? '+' : ''}{niftyP}%)</Badge>
      </div>

      {/* 4 Quadrants Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-up/30 bg-up/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold text-up">Leading Quadrant</span>
            <span className="rounded-md bg-up/20 px-2 py-0.5 text-[11px] font-bold text-up font-mono">
              {sectorsWithRS.filter(s => s.quadrant === 'Leading').length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">RS &gt; 0 · Net Inflow</p>
          <p className="text-xs font-bold text-foreground mt-2 font-mono">
            {sectorsWithRS.filter(s => s.quadrant === 'Leading').map(s => s.g).join(', ') || 'None'}
          </p>
        </div>

        <div className="rounded-2xl border border-brand/30 bg-brand/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold text-brand">Improving Quadrant</span>
            <span className="rounded-md bg-brand/20 px-2 py-0.5 text-[11px] font-bold text-brand font-mono">
              {sectorsWithRS.filter(s => s.quadrant === 'Improving').length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">Momentum Turning Up</p>
          <p className="text-xs font-bold text-foreground mt-2 font-mono">
            {sectorsWithRS.filter(s => s.quadrant === 'Improving').map(s => s.g).join(', ') || 'None'}
          </p>
        </div>

        <div className="rounded-2xl border border-warn/30 bg-warn/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold text-warn">Weakening Quadrant</span>
            <span className="rounded-md bg-warn/20 px-2 py-0.5 text-[11px] font-bold text-warn font-mono">
              {sectorsWithRS.filter(s => s.quadrant === 'Weakening').length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">High Price · Inflow Drying</p>
          <p className="text-xs font-bold text-foreground mt-2 font-mono">
            {sectorsWithRS.filter(s => s.quadrant === 'Weakening').map(s => s.g).join(', ') || 'None'}
          </p>
        </div>

        <div className="rounded-2xl border border-down/30 bg-down/10 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold text-down">Lagging Quadrant</span>
            <span className="rounded-md bg-down/20 px-2 py-0.5 text-[11px] font-bold text-down font-mono">
              {sectorsWithRS.filter(s => s.quadrant === 'Lagging').length}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium mt-1">RS &lt; 0 · Net Outflow</p>
          <p className="text-xs font-bold text-foreground mt-2 font-mono">
            {sectorsWithRS.filter(s => s.quadrant === 'Lagging').map(s => s.g).join(', ') || 'None'}
          </p>
        </div>
      </div>

      {/* Sector Outperformance Table */}
      <Card
        title="Sector Outperformance Leaderboard (Alpha vs Nifty)"
        icon={Award}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-hairline text-muted-foreground font-bold">
              <tr>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Day % Return</th>
                <th className="py-2.5 px-3 text-right">Alpha (vs Nifty)</th>
                <th className="py-2.5 px-3 text-right">Turnover (Cr)</th>
                <th className="py-2.5 px-3 text-center">Rotation Quadrant</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {sectorsWithRS.map((s, idx) => {
                const isOutperforming = s.rs > 0;
                return (
                  <tr key={s.name} className="hover:bg-surface-2 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-foreground flex items-center gap-2">
                      <span className="text-muted-foreground">#{idx + 1}</span>
                      <span>{s.name}</span>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${s.p >= 0 ? 'text-up' : 'text-down'}`}>
                      {s.p >= 0 ? '+' : ''}{s.p.toFixed(2)}%
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${isOutperforming ? 'text-up' : 'text-down'}`}>
                      {isOutperforming ? '+' : ''}{s.rs.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-foreground font-medium">
                      ₹{s.turnover.toLocaleString()} Cr
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        tone={
                          s.quadrant === 'Leading'
                            ? 'up'
                            : s.quadrant === 'Improving'
                            ? 'sim'
                            : s.quadrant === 'Weakening'
                            ? 'warn'
                            : 'down'
                        }
                      >
                        {s.quadrant}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setCurrentScreen('pulse')}
                        className="rounded-lg bg-surface-muted px-2 py-1 text-[11px] font-bold text-brand hover:bg-brand hover:text-white transition-colors"
                      >
                        View Heatmap &rarr;
                      </button>
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
