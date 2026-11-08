import React from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useMarketData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              isWarning
                ? 'border-warn/40 bg-surface-card/95 text-foreground shadow-warn/10'
                : isSuccess
                ? 'border-up/40 bg-surface-card/95 text-foreground shadow-up/10'
                : 'border-hairline bg-surface-card/95 text-foreground'
            }`}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
              isWarning ? 'bg-warn/20 text-warn' : isSuccess ? 'bg-up/20 text-up' : 'bg-brand/20 text-brand'
            }`}>
              {isWarning ? <AlertTriangle className="h-4 w-4" /> : isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-bold text-foreground">{toast.title}</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

