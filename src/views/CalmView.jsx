import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  HeartHandshake,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function CalmView() {
  const [breathePhase, setBreathePhase] = useState('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [isRunning, setIsRunning] = useState(true);

  // Box Breathing cycle: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Hold (4s)
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setPhaseSeconds(prev => {
        if (prev <= 1) {
          setBreathePhase(current => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            if (current === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const [checklist, setChecklist] = useState({
    rule1: true,
    rule2: true,
    rule3: false,
    rule4: true,
    rule5: false
  });

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-up animate-ping" />
            <span className="text-xs font-bold text-brand tracking-wider uppercase">
              Trading Psychology &amp; Discipline
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Calm Zone &amp; Anti-Tilt Protocol
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Re-center your mind before executing. Prevent FOMO, revenge trading, and emotional over-sizing.
          </p>
        </div>

        <Badge tone="live">Mindset Reset</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Interactive Box Breathing Circle (lg:col-span-6) */}
        <Card
          className="lg:col-span-6"
          title="Box Breathing (4-4-4-4 Protocol)"
          icon={HeartHandshake}
          info="Used by elite military units and hedge fund portfolio managers to down-regulate sympathetic nervous arousal under market stress."
          actions={
            <button
              onClick={() => setIsRunning(prev => !prev)}
              className="rounded-xl bg-surface-2 px-3 py-1 text-xs font-bold text-foreground hover:bg-surface-muted transition-colors border border-hairline"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </button>
          }
        >
          <div className="flex flex-col items-center justify-center py-8">
            {/* Pulsing breathing sphere */}
            <div className="relative flex items-center justify-center">
              <div
                className={`flex h-44 w-44 items-center justify-center rounded-full border-2 border-brand/40 bg-gradient-to-tr from-brand/10 to-brand/30 shadow-glow transition-all duration-1000 ease-in-out ${
                  breathePhase === 'Inhale' || breathePhase === 'Hold' ? 'scale-125' : 'scale-90'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className="font-heading text-xl font-extrabold text-foreground">
                    {breathePhase}
                  </span>
                  <span className="font-mono text-3xl font-bold text-brand mt-1">
                    {phaseSeconds}s
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground max-w-sm font-medium">
              Inhale deeply for 4s, hold your lungs comfortably for 4s, exhale smoothly for 4s, and hold empty for 4s.
            </p>
          </div>
        </Card>

        {/* Pre-Trade Psychological Checklist (lg:col-span-6) */}
        <Card
          className="lg:col-span-6"
          title="Pre-Execution Discipline Checklist"
          icon={ShieldAlert}
          status={
            <Badge tone={completedCount === 5 ? 'up' : 'warn'}>
              {completedCount} / 5 Checked
            </Badge>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <div
              onClick={() => toggleCheck('rule1')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                checklist.rule1 ? 'border-up/40 bg-up/10' : 'border-hairline bg-surface-2'
              }`}
            >
              <input type="checkbox" checked={checklist.rule1} readOnly className="mt-0.5 accent-brand" />
              <div>
                <p className="font-bold text-foreground">Defined Stop-Loss &amp; Sizing</p>
                <p className="text-muted-foreground text-[11px] font-medium">
                  I know the exact exit invalidation price before hitting buy/sell. Risk is &le;1% of capital.
                </p>
              </div>
            </div>

            <div
              onClick={() => toggleCheck('rule2')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                checklist.rule2 ? 'border-up/40 bg-up/10' : 'border-hairline bg-surface-2'
              }`}
            >
              <input type="checkbox" checked={checklist.rule2} readOnly className="mt-0.5 accent-brand" />
              <div>
                <p className="font-bold text-foreground">Not Chasing an Extended Move</p>
                <p className="text-muted-foreground text-[11px] font-medium">
                  Price is not over-extended from VWAP. Entering at value rather than buying green tops.
                </p>
              </div>
            </div>

            <div
              onClick={() => toggleCheck('rule3')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                checklist.rule3 ? 'border-up/40 bg-up/10' : 'border-hairline bg-surface-2'
              }`}
            >
              <input type="checkbox" checked={checklist.rule3} readOnly className="mt-0.5 accent-brand" />
              <div>
                <p className="font-bold text-foreground">No Revenge Trading or Tilt</p>
                <p className="text-muted-foreground text-[11px] font-medium">
                  I am completely detached from past trade results. My ego is not driving this trade.
                </p>
              </div>
            </div>

            <div
              onClick={() => toggleCheck('rule4')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                checklist.rule4 ? 'border-up/40 bg-up/10' : 'border-hairline bg-surface-2'
              }`}
            >
              <input type="checkbox" checked={checklist.rule4} readOnly className="mt-0.5 accent-brand" />
              <div>
                <p className="font-bold text-foreground">Confluence with Market Pulse</p>
                <p className="text-muted-foreground text-[11px] font-medium">
                  Sector money flow, OI flow, and overall market breadth align with trade direction.
                </p>
              </div>
            </div>

            <div
              onClick={() => toggleCheck('rule5')}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                checklist.rule5 ? 'border-up/40 bg-up/10' : 'border-hairline bg-surface-2'
              }`}
            >
              <input type="checkbox" checked={checklist.rule5} readOnly className="mt-0.5 accent-brand" />
              <div>
                <p className="font-bold text-foreground">Ready to Accept the Loss if Wrong</p>
                <p className="text-muted-foreground text-[11px] font-medium">
                  I accept that losing is simply the cost of doing business. I will cut without hesitation.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
