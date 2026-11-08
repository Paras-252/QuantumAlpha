import React, { useState } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { useAuth } from '../../context/AuthContext';
import {
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
  Search,
  Moon,
  Sun,
  Play,
  Pause,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';

export default function Header() {
  const {
    currentScreen,
    setCurrentScreen,
    theme,
    toggleTheme,
    isPresentationMode,
    setIsPresentationMode,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    marketStatus,
    marketSubtext,
    isLiveSimulating,
    setIsLiveSimulating,
    isZerodhaLive,
    zerodhaStatus,
    setIsZerodhaModalOpen,
    isKiteSimulating,
    zerodhaStats
  } = useMarketData();

  const { user, isAuthenticated, logout, setIsAuthModalOpen } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Removed crypto as requested
  const navItems = [
    { id: 'pulse', label: 'Pulse', icon: Activity },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'options', label: 'Options', icon: SlidersHorizontal },
    { id: 'radar', label: 'Radar', icon: Compass },
    { id: 'calm', label: 'Calm', icon: HeartHandshake },
    { id: 'liquidity', label: 'Liquidity', icon: Droplets },
    { id: 'oi-flow', label: 'OI Flow', icon: Layers },
    { id: 'screeners', label: 'Screeners', icon: Filter },
    { id: 'academy', label: 'Academy', icon: GraduationCap },
    { id: 'journal', label: 'Journal', icon: BookOpen }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-surface/95 backdrop-blur-md">
      {/* =========================================================================
          ROW 1: Primary Navigation (Logo, All Screens Fully Visible, User Profile)
          ========================================================================= */}
      <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-3 px-3 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentScreen('pulse')}
            className="group flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
            title="Quantum Alpha - See the market move"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-deep to-brand text-white shadow-glow">
              {/* Quantum Alpha Stylized Diamond Logo */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" opacity="0.9" />
                <path d="M12 17L4.5 11.5L2 13.5L12 21L22 13.5L19.5 11.5L12 17Z" />
              </svg>
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-foreground max-sm:hidden">
              Quantum Alpha
            </span>
            <span className="rounded-md bg-brand/12 px-1.5 py-0.5 text-[10px] font-bold text-brand tracking-wider uppercase max-md:hidden">
              PRO
            </span>
          </button>
        </div>

        {/* All Main Screen Nav Pills - Given full width so all tabs show clearly without scroll */}
        <nav aria-label="Screens" className="flex flex-1 items-center justify-start xl:justify-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isActive
                    ? 'bg-surface-raised text-foreground font-semibold shadow-control border border-hairline/80'
                    : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                }`}
                title={item.label}
              >
                <Icon
                  className={`h-3.5 w-3.5 transition-colors ${
                    isActive ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <span className="text-foreground">{item.label}</span>
                {item.id === 'journal' && (
                  <span className="ml-0.5 size-1.5 rounded-full bg-up animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Top Right Quick Actions: Theme, Settings, User Account */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand border border-hairline/40"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-warn" /> : <Moon className="h-3.5 w-3.5 text-brand" />}
          </button>

          {/* Display Settings Cog */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Display settings"
            title="Configure layout, audio & stream"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand border border-hairline/40"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          <div className="mx-0.5 h-4 w-px bg-hairline" />

          {/* User Account / Sign In */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="inline-flex h-8 items-center gap-2 rounded-full bg-surface-2 pl-1 pr-2.5 text-xs font-medium text-foreground hover:bg-surface-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand border border-hairline"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white font-bold text-[10px] shadow-sm">
                  {user.avatar || 'TR'}
                </div>
                <span className="max-sm:hidden font-medium text-foreground">{user.name}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-hairline bg-surface-card p-1.5 shadow-2xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="border-b border-hairline px-3 py-2">
                    <p className="text-xs font-bold text-foreground">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-brand" />
                      <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                        {user.plan} Active
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setCurrentScreen('journal')}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-foreground hover:bg-surface-2 transition-colors font-medium"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>My Trading Journal</span>
                    </button>
                    <button
                      onClick={() => setCurrentScreen('radar')}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-foreground hover:bg-surface-2 transition-colors font-medium"
                    >
                      <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Watchlist &amp; Radar</span>
                    </button>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-foreground hover:bg-surface-2 transition-colors font-medium"
                    >
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Terminal Preferences</span>
                    </button>
                  </div>

                  <div className="border-t border-hairline pt-1">
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-down hover:bg-down/10 font-medium transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand px-3.5 text-xs font-semibold text-white shadow-glow transition-all hover:bg-brand-deep active:scale-95"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          ROW 2: Market Status & Action Toolbar (Search, NSE, Kite, Simulator)
          ========================================================================= */}
      <div className="border-t border-hairline/70 bg-surface-2/40 px-3 sm:px-6 py-1.5">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-2.5 text-xs overflow-x-auto no-scrollbar">
          {/* Left Action Controls: Search, NSE Status, Kite Ticker, Closing Snapshot */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Search Ctrl+K */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              aria-label="Search screens and symbols"
              className="group/search inline-flex h-7 items-center gap-2 rounded-full bg-surface-card px-2.5 text-[12px] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand border border-hairline shadow-2xs"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-foreground font-medium max-sm:hidden">Search symbols &amp; screens</span>
              <span className="text-foreground font-medium sm:hidden">Search</span>
              <kbd className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-subtle-foreground font-mono">
                Ctrl K
              </kbd>
            </button>

            {/* NSE Market Status Pill (Live vs Closed / Last Session) */}
            <div
              className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-surface-card px-2.5 text-[11.5px] font-medium border border-hairline select-none shadow-2xs"
              title={`NSE Capital & Derivative Market: ${marketSubtext}`}
            >
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  marketStatus === 'Live' ? 'bg-up' : 'bg-muted-foreground'
                }`}
              >
                {marketStatus === 'Live' && (
                  <span className="absolute -inset-0.5 rounded-full bg-up animate-ping opacity-75" />
                )}
              </span>
              <span className="font-bold text-foreground">NSE</span>
              <span className={marketStatus === 'Live' ? 'text-up font-semibold' : 'text-muted-foreground'}>
                {marketStatus === 'Live' ? 'Live' : 'Closed'}
              </span>
              <span className="text-[10px] text-subtle-foreground hidden md:inline">
                ({marketStatus === 'Live' ? '1-min delayed' : 'Last Close'})
              </span>
            </div>

            {/* Zerodha Kite Ticker Live Pill */}
            <button
              onClick={() => setIsZerodhaModalOpen(true)}
              title={
                isZerodhaLive
                  ? (isKiteSimulating
                      ? 'Kite Ticker: Simulating Live Ticks (Click to configure)'
                      : `Kite Live Ticker: ${zerodhaStatus} (${zerodhaStats.ticksCount} ticks ingested)`)
                  : 'Zerodha Kite Ticker: OFF (Click to turn ON and configure)'
              }
              className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-semibold transition-all border outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-2xs ${
                isZerodhaLive && (zerodhaStatus === 'CONNECTED' || isKiteSimulating)
                  ? 'bg-[#ff5722]/15 text-[#ff5722] border-[#ff5722]/40 shadow-sm'
                  : isZerodhaLive && zerodhaStatus === 'AUTH_REQUIRED'
                  ? 'bg-warn/15 text-warn border-warn/40'
                  : isZerodhaLive && zerodhaStatus === 'CONNECTING'
                  ? 'bg-brand/15 text-brand border-brand/40 animate-pulse'
                  : 'bg-surface-card text-muted-foreground border-hairline hover:text-foreground hover:bg-surface-muted'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isZerodhaLive && (zerodhaStatus === 'CONNECTED' || isKiteSimulating) ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5722] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff5722]"></span>
                  </>
                ) : isZerodhaLive && zerodhaStatus === 'AUTH_REQUIRED' ? (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-warn"></span>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/60"></span>
                )}
              </span>
              <Zap className="h-3 w-3 text-[#ff5722]" />
              <span className="font-bold">Kite:</span>
              <span>
                {isZerodhaLive
                  ? (isKiteSimulating
                      ? 'Simulating'
                      : zerodhaStatus === 'CONNECTED'
                      ? 'Live'
                      : zerodhaStatus === 'AUTH_REQUIRED'
                      ? 'Token Required'
                      : 'Connecting')
                  : 'OFF'}
              </span>
            </button>

            {/* Live Simulation / Last Close Toggle */}
            <button
              onClick={() => setIsLiveSimulating(prev => !prev)}
              title={
                isLiveSimulating
                  ? "Live simulator running (click to freeze at last official close)"
                  : "Freezed at last official closing data (click to resume simulated live stream)"
              }
              className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[11.5px] font-semibold transition-all border shadow-2xs ${
                isLiveSimulating
                  ? 'bg-up/12 text-up border-up/30 hover:bg-up/20'
                  : 'bg-surface-card text-muted-foreground border-hairline hover:text-foreground'
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>{isLiveSimulating ? 'Simulating Ticks' : 'Closing Snapshot'}</span>
            </button>
          </div>

          {/* Right Action Controls: Auto Presentation Mode */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPresentationMode(prev => !prev)}
              title={
                isPresentationMode
                  ? "Pause auto-rotation (every 20s)"
                  : "Presentation mode (auto-rotate screens every 20s)"
              }
              className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] text-muted-foreground transition-colors hover:bg-surface-card hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-brand border border-hairline shadow-2xs ${
                isPresentationMode ? 'bg-brand/20 text-brand ring-1 ring-brand' : 'bg-surface-card'
              }`}
            >
              {isPresentationMode ? <Pause className="h-3 w-3 text-brand" /> : <Play className="h-3 w-3" />}
              <span className="max-sm:hidden">{isPresentationMode ? 'Auto-Rotating (20s)' : 'Presentation'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
