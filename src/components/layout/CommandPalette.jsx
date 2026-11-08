import React, { useState, useEffect, useRef } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import {
  Search,
  Activity,
  Newspaper,
  SlidersHorizontal,
  Compass,
  HeartHandshake,
  Droplets,
  Layers,
  Filter,
  GraduationCap,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentScreen,
    setSelectedOptionSymbol,
    radarItems,
    indices,
    changePulseView,
    setIsZerodhaModalOpen,
    isZerodhaLive,
    toggleZerodhaLive
  } = useMarketData();

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Screens matching Tredye
  const screens = [
    { id: 'pulse', label: 'Pulse · Overview', icon: Activity, cat: 'Screens', action: () => { changePulseView('overview'); setCurrentScreen('pulse'); } },
    { id: 'pulse-flow', label: 'Pulse · Capital Flow', icon: TrendingUp, cat: 'Screens', action: () => changePulseView('flow') },
    { id: 'pulse-orderflow', label: 'Pulse · Orderflow & Depth', icon: Layers, cat: 'Screens', action: () => changePulseView('orderflow') },
    { id: 'options', label: 'Option Pulse (Chain & Greeks)', icon: SlidersHorizontal, cat: 'Screens', action: () => setCurrentScreen('options') },
    { id: 'oi-flow', label: 'OI Flow (Long/Short Buildups)', icon: Layers, cat: 'Screens', action: () => setCurrentScreen('oi-flow') },
    { id: 'liquidity', label: 'Liquidity Map (Order Flow)', icon: Droplets, cat: 'Screens', action: () => setCurrentScreen('liquidity') },
    { id: 'strength', label: 'Strength Boards (Relative Strength)', icon: TrendingUp, cat: 'Screens', action: () => setCurrentScreen('strength') },
    { id: 'screeners', label: 'Screeners (Basis, RSI, IV)', icon: Filter, cat: 'Screens', action: () => setCurrentScreen('screeners') },
    { id: 'radar', label: 'Stock Radar (Watchlist)', icon: Compass, cat: 'Screens', action: () => setCurrentScreen('radar') },
    { id: 'calm', label: 'Calm Zone (Trading Psychology)', icon: HeartHandshake, cat: 'Screens', action: () => setCurrentScreen('calm') },
    { id: 'journal', label: 'Trading Journal (P&L & Analytics)', icon: BookOpen, cat: 'Screens', action: () => setCurrentScreen('journal') },
    { id: 'academy', label: 'F&O Academy (Education & Payoff)', icon: GraduationCap, cat: 'Screens', action: () => setCurrentScreen('academy') },
    { id: 'news', label: 'Market News & Catalysts', icon: Newspaper, cat: 'Screens', action: () => setCurrentScreen('news') },
    { id: 'zerodha', label: 'Zerodha Kite Connect (Live Ticker Settings & Tokens)', icon: TrendingUp, cat: 'Settings', action: () => setIsZerodhaModalOpen(true) },
  ];

  const symbols = [
    ...indices.map(i => ({ id: i.symbol, label: `${i.symbol} · ${i.name}`, type: 'Index' })),
    ...radarItems.map(r => ({ id: r.symbol, label: `${r.symbol} (₹${r.ltp})`, type: 'Stock' }))
  ];

  const filteredScreens = screens.filter(s =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSymbols = symbols.filter(s =>
    s.label.toLowerCase().includes(query.toLowerCase()) ||
    s.id.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectScreen = (screen) => {
    if (typeof screen === 'object' && screen.action) {
      screen.action();
    } else {
      setCurrentScreen(typeof screen === 'string' ? screen : screen.id);
    }
    setIsCommandPaletteOpen(false);
  };

  const handleSelectSymbol = (sym) => {
    setSelectedOptionSymbol(sym);
    setCurrentScreen('options');
    setIsCommandPaletteOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-hairline bg-surface-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-foreground"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3.5">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search screens, indices or stocks (e.g. Nifty, Options, Tata Steel)..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              Clear
            </button>
          )}
          <kbd className="rounded-md bg-surface-2 border border-hairline px-2 py-0.5 text-[11px] font-mono text-subtle-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-hairline">
          {/* Screens Section */}
          {filteredScreens.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-subtle-foreground uppercase">
                Terminal Screens
              </div>
              {filteredScreens.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectScreen(s)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-brand border border-hairline/40">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-foreground">{s.label}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Symbols Section */}
          {filteredSymbols.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-subtle-foreground uppercase">
                F&amp;O Symbols &amp; Options
              </div>
              {filteredSymbols.slice(0, 6).map(sym => (
                <button
                  key={sym.id}
                  onClick={() => handleSelectSymbol(sym.id)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded bg-brand/12 px-1.5 py-0.5 text-[10px] font-bold text-brand uppercase">
                      {sym.type}
                    </span>
                    <span className="font-mono text-foreground">{sym.label}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">Open Option Chain &rarr;</span>
                </button>
              ))}
            </div>
          )}

          {filteredScreens.length === 0 && filteredSymbols.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
