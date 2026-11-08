import React from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { Play, Pause, X } from 'lucide-react';

export default function PresentationBar() {
  const {
    isPresentationMode,
    setIsPresentationMode,
    presentationProgress,
    currentScreen,
    presentationInterval
  } = useMarketData();

  if (!isPresentationMode) return null;

  return (
    <div className="relative w-full bg-brand/10 border-b border-brand/20 px-4 py-1.5 flex items-center justify-between text-xs text-foreground backdrop-blur-sm z-30">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
        <span className="font-semibold text-brand uppercase tracking-wider text-[11px]">
          Presentation Mode Active
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground capitalize">
          Viewing: <strong className="text-foreground">{currentScreen}</strong>
        </span>
        <span className="text-muted-foreground text-[11px]">
          (Cycling every {presentationInterval}s)
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-24 sm:w-36 h-1.5 rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full bg-brand transition-all duration-200"
            style={{ width: `${presentationProgress}%` }}
          />
        </div>

        <button
          onClick={() => setIsPresentationMode(false)}
          className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
}

