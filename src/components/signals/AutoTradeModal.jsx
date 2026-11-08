import React, { useState } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import {
  X,
  Zap,
  ShieldAlert,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Info
} from 'lucide-react';

export default function AutoTradeModal({ signal, isOpen, onClose }) {
  const { addTrade, showToast, playAlertSound, isZerodhaLive } = useMarketData();

  if (!isOpen || !signal) return null;

  const [orderType, setOrderType] = useState('MARKET'); // MARKET | LIMIT | BRACKET
  const [maxRiskAmount, setMaxRiskAmount] = useState(2000); // User wants to risk ₹2,000 max
  const [customSl, setCustomSl] = useState(signal.sl);
  const [customTarget1, setCustomTarget1] = useState(signal.target1);
  const [customTarget2, setCustomTarget2] = useState(signal.target2);

  // Calculate dynamic quantity based on max risk amount
  const slDistance = Math.abs(signal.entry - customSl) || 1;
  const calculatedQty = Math.max(1, Math.floor(maxRiskAmount / slDistance));
  const totalInvestment = Math.round(signal.entry * calculatedQty);
  const maxLoss = Math.round(slDistance * calculatedQty);
  const potentialGainT1 = Math.round(Math.abs(customTarget1 - signal.entry) * calculatedQty);
  const potentialGainT2 = Math.round(Math.abs(customTarget2 - signal.entry) * calculatedQty);
  const dynamicRR = (potentialGainT1 / maxLoss || 1).toFixed(1);

  const handleExecuteTrade = (isPaper = true) => {
    // Add trade to Journal
    const tradeEntry = {
      sym: signal.symbol,
      side: signal.action.toLowerCase() === 'sell' ? 'short' : 'long',
      qty: calculatedQty,
      entry: signal.entry,
      exit: customTarget1,
      tag: signal.strategyName,
      note: `Auto-generated ${signal.priorityGrade} Signal (${signal.conviction}% conviction). SL: ₹${customSl}, T1: ₹${customTarget1}, R:R: 1:${dynamicRR}`,
      from: new Date().toISOString().slice(0, 10),
      to: new Date().toISOString().slice(0, 10)
    };

    addTrade(tradeEntry);
    playAlertSound('success');

    if (isPaper) {
      showToast(
        'Paper Trade Executed',
        `Filled ${calculatedQty} qty of ${signal.symbol} at ₹${signal.entry}. SL: ₹${customSl}, T1: ₹${customTarget1}. Recorded in Journal.`,
        'success'
      );
    } else {
      showToast(
        'Broker Order Dispatched',
        `Bracket order sent to broker for ${calculatedQty} qty of ${signal.symbol} with SL ₹${customSl} and Target ₹${customTarget1}.`,
        'success'
      );
    }

    onClose();
  };

  const isBuy = signal.action === 'BUY';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-hairline bg-surface-card p-4 sm:p-6 shadow-2xl flex flex-col overflow-hidden text-foreground"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isBuy ? 'bg-up/15 text-up' : 'bg-down/15 text-down'
            }`}>
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                  isBuy ? 'bg-up/12 text-up' : 'bg-down/12 text-down'
                }`}>
                  {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {signal.action} {signal.side}
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {signal.symbol}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-semibold text-brand">
                  {signal.priorityGrade} Setup ({signal.conviction}% Conviction)
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {signal.strategyName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Trade Parameters Form */}
        <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-1">
          {/* Strategy Rationale Box */}
          <div className="rounded-xl border border-hairline/80 bg-surface-2 p-3 text-xs text-foreground/90 leading-relaxed font-medium">
            <div className="flex items-center gap-1.5 text-brand font-bold text-[11px] uppercase tracking-wider mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Algorithmic Rationale &amp; Evidence</span>
            </div>
            {signal.rationale}
          </div>

          {/* 4 Bracket Price Inputs: Entry, SL, Target 1, Target 2 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Entry Price */}
            <div className="rounded-xl border border-hairline bg-surface-2 p-3">
              <span className="text-[10.5px] font-bold text-muted-foreground uppercase block">Entry Price</span>
              <div className="mt-1 font-mono text-lg font-bold text-foreground">
                ₹{signal.entry.toLocaleString()}
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Spot: ₹{signal.spot}</span>
            </div>

            {/* Stop Loss (SL) */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-rose-500 uppercase">Stop Loss (SL)</span>
                <ShieldAlert className="h-3 w-3 text-rose-500" />
              </div>
              <input
                type="number"
                value={customSl}
                onChange={e => setCustomSl(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full bg-transparent font-mono text-lg font-bold text-rose-500 outline-none"
              />
              <span className="text-[10px] text-rose-500 font-mono">
                Risk: {slDistance.toFixed(1)} pts ({((slDistance / signal.entry) * 100).toFixed(2)}%)
              </span>
            </div>

            {/* Target 1 */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-emerald-500 uppercase">Target 1 (1.5R)</span>
                <Target className="h-3 w-3 text-emerald-500" />
              </div>
              <input
                type="number"
                value={customTarget1}
                onChange={e => setCustomTarget1(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full bg-transparent font-mono text-lg font-bold text-emerald-500 outline-none"
              />
              <span className="text-[10px] text-emerald-500 font-mono">
                Gain: {Math.abs(customTarget1 - signal.entry).toFixed(1)} pts
              </span>
            </div>

            {/* Target 2 */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-emerald-500 uppercase">Target 2 (2.5R)</span>
                <Target className="h-3 w-3 text-emerald-500" />
              </div>
              <input
                type="number"
                value={customTarget2}
                onChange={e => setCustomTarget2(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full bg-transparent font-mono text-lg font-bold text-emerald-500 outline-none"
              />
              <span className="text-[10px] text-emerald-500 font-mono">
                Gain: {Math.abs(customTarget2 - signal.entry).toFixed(1)} pts
              </span>
            </div>
          </div>

          {/* Risk Sizing & Quantity Auto-Calculator */}
          <div className="rounded-xl border border-hairline bg-surface-2 p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-foreground">Risk-Based Position Sizer</span>
                <p className="text-[11px] text-muted-foreground">
                  Specify max loss you are willing to risk; quantity auto-adjusts so SL exit equals exact budget.
                </p>
              </div>

              {/* Quick Risk Buttons */}
              <div className="flex items-center gap-1 text-xs font-mono font-bold">
                {[1000, 2000, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setMaxRiskAmount(amt)}
                    className={`px-2 py-0.5 rounded-lg border transition-all ${
                      maxRiskAmount === amt
                        ? 'bg-brand text-white border-brand'
                        : 'bg-surface-card text-muted-foreground border-hairline hover:text-foreground'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-hairline text-xs font-mono">
              <div>
                <span className="text-muted-foreground text-[10px] block">Calculated Qty</span>
                <span className="text-foreground font-bold text-base">{calculatedQty} Qty</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Total Capital</span>
                <span className="text-foreground font-bold text-base">₹{totalInvestment.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-rose-500 text-[10px] block">Max Loss @ SL</span>
                <span className="text-rose-500 font-bold text-base">-₹{maxLoss.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-emerald-500 text-[10px] block">Target 1 Profit</span>
                <span className="text-emerald-500 font-bold text-base">+₹{potentialGainT1.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Institutional Confirmations Pills */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Institutional Confluence Signals
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {signal.factors.map((f, i) => (
                <div key={i} className="rounded-lg border border-hairline bg-surface-2 p-2 text-xs">
                  <span className="text-muted-foreground text-[10px] block truncate">{f.label}</span>
                  <span className={`font-bold font-mono text-[11px] ${
                    f.tone === 'up' ? 'text-up' : f.tone === 'down' ? 'text-down' : 'text-foreground'
                  }`}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3.5 border-t border-hairline flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Clock className="h-3.5 w-3.5" />
            <span>Horizon: {signal.horizonLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExecuteTrade(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-muted transition-colors shadow-xs"
            >
              <span>Paper Trade (Journal)</span>
            </button>

            <button
              onClick={() => handleExecuteTrade(false)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand/90 px-4 py-2 text-xs font-bold text-white transition-colors shadow-glow"
            >
              <Zap className="h-3.5 w-3.5 fill-white" />
              <span>1-Click Auto Execute</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
