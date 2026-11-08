import React from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Zap,
  Clock,
  LayoutGrid,
  Sun,
  Moon,
  RotateCcw
} from 'lucide-react';

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    theme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    isLiveSimulating,
    setIsLiveSimulating,
    presentationInterval,
    setPresentationInterval,
    marketStatus,
    setMarketStatus,
    isZerodhaLive,
    setIsZerodhaModalOpen,
    zerodhaStatus
  } = useMarketData();

  const { user } = useAuth();

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-hairline bg-surface-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-foreground"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-2 text-brand border border-hairline/40">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">Terminal Settings</h3>
              <p className="text-xs text-muted-foreground font-medium">Customize display, stream &amp; audio</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Theme setting */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">Color Theme</p>
              <p className="text-[11px] text-muted-foreground font-medium">Dark high-contrast or light clean</p>
            </div>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-bold hover:bg-surface-muted transition-colors text-foreground"
            >
              {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-brand" /> : <Sun className="h-3.5 w-3.5 text-warn" />}
              <span className="capitalize">{theme} Mode</span>
            </button>
          </div>

          {/* Zerodha Kite Live Feed */}
          <div className="flex items-center justify-between rounded-xl border border-hairline/80 bg-surface-2/40 p-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#ff5722]" />
                <p className="font-bold text-foreground">Zerodha Kite Ticker</p>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {isZerodhaLive ? `Status: ${zerodhaStatus}` : 'Sub-50ms live tick-by-tick streaming'}
              </p>
            </div>
            <button
              onClick={() => {
                setIsSettingsOpen(false);
                setIsZerodhaModalOpen(true);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-colors ${
                isZerodhaLive
                  ? 'bg-[#ff5722]/15 text-[#ff5722] border border-[#ff5722]/30 hover:bg-[#ff5722]/25'
                  : 'bg-surface-2 text-foreground border border-hairline hover:bg-surface-muted'
              }`}
            >
              <span>{isZerodhaLive ? 'Configure (ON)' : 'Set Up & Turn ON'}</span>
            </button>
          </div>

          {/* Real-time Stream Simulation */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">Live Market Simulator</p>
              <p className="text-[11px] text-muted-foreground font-medium">Simulate live ticks or freeze on last close</p>
            </div>
            <button
              onClick={() => setIsLiveSimulating(prev => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-colors ${
                isLiveSimulating
                  ? 'bg-up/15 text-up border border-up/30'
                  : 'bg-surface-2 text-muted-foreground border border-hairline'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{isLiveSimulating ? 'Active Ticks' : 'Frozen Close'}</span>
            </button>
          </div>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">Audio Chimes</p>
              <p className="text-[11px] text-muted-foreground font-medium">Synthesized sound on trade logs &amp; alerts</p>
            </div>
            <button
              onClick={() => setSoundEnabled(prev => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-colors ${
                soundEnabled
                  ? 'bg-brand/15 text-brand border border-brand/30'
                  : 'bg-surface-2 text-muted-foreground border border-hairline'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
            </button>
          </div>

          {/* Presentation Timer */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">Auto-Rotate Speed</p>
              <p className="text-[11px] text-muted-foreground font-medium">Screen cycle interval in presentation mode</p>
            </div>
            <select
              value={presentationInterval}
              onChange={e => setPresentationInterval(Number(e.target.value))}
              className="rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-brand cursor-pointer"
            >
              <option value={10}>10 seconds</option>
              <option value={20}>20 seconds (Default)</option>
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
            </select>
          </div>

          {/* User Account Info */}
          <div className="rounded-xl border border-hairline bg-surface-2 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground mb-1">
              Account Subscription
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">{user ? user.name : 'Guest User'}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{user ? user.email : 'Not signed in'}</p>
              </div>
              <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                {user ? user.plan : 'Free Tier'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-hairline pt-4 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-brand-deep transition-all"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
