import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketData } from '../../context/MarketDataContext';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  X,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, loginDemo } = useAuth();
  const { playAlertSound } = useMarketData();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (mode === 'login') {
        login(email, password);
      } else {
        register(name, email, password);
      }
      playAlertSound('success');
    }, 400);
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loginDemo();
      playAlertSound('success');
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={() => setIsAuthModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-hairline bg-surface-card p-6 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-foreground"
        onClick={e => e.stopPropagation()}
      >
        {/* Radial glow background effect matching Tredye login */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 rounded-lg p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-deep to-brand text-white shadow-glow">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
              <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" opacity="0.9" />
              <path d="M12 17L4.5 11.5L2 13.5L12 21L22 13.5L19.5 11.5L12 17Z" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold tracking-tight">
            {mode === 'login' ? 'Sign in to Tredye' : 'Create Free Tredye Account'}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === 'login'
              ? 'Access live NSE market pulse, F&O order flow & trading journal'
              : 'Join thousands of professional NSE traders and analyze before you trade'}
          </p>
        </div>

        {/* Quick Demo Login Pill */}
        <button
          onClick={handleQuickDemo}
          type="button"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/40 bg-brand/10 p-2.5 text-xs font-semibold text-brand hover:bg-brand/20 transition-all shadow-sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>One-Click Instant Sign-In (Pro Trader Demo)</span>
        </button>

        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-full border-t border-hairline" />
          <span className="absolute bg-surface-card px-2 text-[11px] text-subtle-foreground uppercase">
            or continue with credentials
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-down/10 border border-down/30 p-2.5 text-xs text-down">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="mb-1 block font-medium text-foreground-secondary">
                Full Name / Handle
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Paras Trader"
                  className="w-full rounded-xl border border-hairline bg-surface-2 py-2.5 pr-3 pl-9 text-foreground placeholder:text-muted-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block font-medium text-foreground-secondary">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="trader@tredye.com"
                className="w-full rounded-xl border border-hairline bg-surface-2 py-2.5 pr-3 pl-9 text-foreground placeholder:text-muted-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-foreground-secondary">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-hairline bg-surface-2 py-2.5 pr-3 pl-9 text-foreground placeholder:text-muted-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 font-semibold text-white shadow-glow hover:bg-brand-deep active:scale-98 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Terminal' : 'Create Free Account'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 text-center text-xs text-muted-foreground">
          {mode === 'login' ? (
            <p>
              New to Tredye?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="font-semibold text-brand hover:underline"
              >
                Create a free account &rarr;
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="font-semibold text-brand hover:underline"
              >
                Sign in &rarr;
              </button>
            </p>
          )}
        </div>

        {/* Features Unlocked List */}
        <div className="mt-5 border-t border-hairline pt-3">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-subtle-foreground mb-1.5">
            Features Unlocked After Sign-in:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-up shrink-0" />
              <span>Full Option Chain & Greeks</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-up shrink-0" />
              <span>Real-Time OI Flow Quadrants</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-up shrink-0" />
              <span>Private Trading Journal</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-up shrink-0" />
              <span>Institutional Liquidity Map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

