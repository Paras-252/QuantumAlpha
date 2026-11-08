import React, { useState } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { ACADEMY_MODULES } from '../data/marketData';
import {
  GraduationCap,
  BookOpen,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2
} from 'lucide-react';

export default function AcademyView() {
  const [selectedModule, setSelectedModule] = useState(ACADEMY_MODULES[0]);

  // Interactive Payoff Simulator State
  const [strategy, setStrategy] = useState('straddle'); // 'straddle' | 'long_call' | 'iron_condor'
  const [spotPrice, setSpotPrice] = useState(25000);
  const [straddleStrike, setStraddleStrike] = useState(25000);
  const [straddlePremium, setStraddlePremium] = useState(240); // total combined premium

  // Calculate Payoff Curve Points
  const strikes = [];
  for (let s = spotPrice - 600; s <= spotPrice + 600; s += 50) {
    let payoff = 0;
    if (strategy === 'straddle') {
      const dist = Math.abs(s - straddleStrike);
      payoff = straddlePremium - dist;
    } else if (strategy === 'long_call') {
      const callPrem = 150;
      payoff = Math.max(0, s - straddleStrike) - callPrem;
    } else {
      const wing = 200;
      const credit = 130;
      const dist = Math.abs(s - straddleStrike);
      if (dist < 100) payoff = credit;
      else if (dist > 100 + wing) payoff = credit - wing;
      else payoff = credit - (dist - 100);
    }
    strikes.push({ s, payoff });
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
            <span className="text-xs font-bold text-brand tracking-wider uppercase">
              Free NSE Derivatives Education
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            F&amp;O Academy &amp; Interactive Strategy Labs
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Master option chains, Greeks, dealer gamma, and risk management with visual mini-simulations.
          </p>
        </div>

        <Badge tone="live">5 Modules · Interactive</Badge>
      </div>

      {/* Interactive Payoff Simulator Card */}
      <Card
        title="Interactive Derivatives Payoff Simulator"
        icon={Sliders}
        info="Visualizes the P&L at expiration across different underlying prices for common option structures."
        actions={
          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-hairline">
            <button
              onClick={() => setStrategy('straddle')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                strategy === 'straddle' ? 'bg-brand text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Short Straddle
            </button>
            <button
              onClick={() => setStrategy('long_call')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                strategy === 'long_call' ? 'bg-brand text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Long Call
            </button>
            <button
              onClick={() => setStrategy('iron_condor')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                strategy === 'iron_condor' ? 'bg-brand text-white' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Iron Condor
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
          {/* Controls (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1 text-muted-foreground font-semibold">
                <span>ATM Strike:</span>
                <strong className="text-foreground">{straddleStrike}</strong>
              </div>
              <input
                type="range"
                min={24400}
                max={25600}
                step={50}
                value={straddleStrike}
                onChange={e => setStraddleStrike(Number(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-muted-foreground font-semibold">
                <span>Premium Collected:</span>
                <strong className="text-brand">₹{straddlePremium}</strong>
              </div>
              <input
                type="range"
                min={100}
                max={400}
                step={10}
                value={straddlePremium}
                onChange={e => setStraddlePremium(Number(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
            </div>

            <div className="rounded-xl border border-hairline bg-surface-2 p-3 space-y-1.5 text-[11px] font-semibold">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lower Breakeven:</span>
                <strong className="text-down font-bold">₹{straddleStrike - straddlePremium}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upper Breakeven:</span>
                <strong className="text-up font-bold">₹{straddleStrike + straddlePremium}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Profit:</span>
                <strong className="text-up font-bold">+₹{straddlePremium} / share</strong>
              </div>
            </div>
          </div>

          {/* Payoff Diagram (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col justify-end h-56 pt-2">
            <div className="relative w-full h-44 flex items-end justify-between border-b border-hairline/80 px-2">
              {/* Zero line */}
              <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-subtle-foreground/40 pointer-events-none" />

              {strikes.map((pt) => {
                const isProfit = pt.payoff >= 0;
                const heightPct = Math.min(100, (Math.abs(pt.payoff) / 300) * 50);

                return (
                  <div key={pt.s} className="flex-1 flex flex-col items-center justify-center h-full group relative">
                    <div
                      className={`w-1.5 sm:w-2 rounded-t transition-all ${
                        isProfit ? 'bg-up/80 group-hover:bg-up' : 'bg-down/80 group-hover:bg-down'
                      }`}
                      style={{
                        height: `${Math.max(4, heightPct)}%`,
                        alignSelf: isProfit ? 'flex-end' : 'flex-start',
                        transform: isProfit ? 'none' : 'translateY(100%)'
                      }}
                      title={`Spot: ${pt.s} | Payoff: ₹${pt.payoff}`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-2 px-2 font-bold">
              <span>{spotPrice - 600}</span>
              <span className="text-foreground font-bold">{straddleStrike} (Strike)</span>
              <span>{spotPrice + 600}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Curriculum Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACADEMY_MODULES.map((mod) => (
          <div
            key={mod.id}
            onClick={() => setSelectedModule(mod)}
            className={`cursor-pointer rounded-2xl border p-4 transition-all shadow-card ${
              selectedModule.id === mod.id
                ? 'border-brand bg-brand/10 shadow-glow'
                : 'border-hairline bg-surface-card hover:border-brand/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge tone="sim">{mod.level}</Badge>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono font-medium">
                <Clock className="h-3 w-3" /> {mod.duration}
              </span>
            </div>

            <h3 className="font-heading text-sm font-bold text-foreground mt-3">
              {mod.title}
            </h3>

            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 font-medium">
              {mod.description}
            </p>

            <div className="mt-4 border-t border-hairline/60 pt-3">
              <span className="text-[10px] font-bold uppercase text-subtle-foreground tracking-wider block mb-1">
                Topics Covered:
              </span>
              <ul className="space-y-1 text-[11px] text-foreground font-medium">
                {mod.topics.slice(0, 3).map((t, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="h-3 w-3 text-brand shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
