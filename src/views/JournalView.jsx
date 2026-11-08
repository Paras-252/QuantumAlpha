import React, { useState, useMemo } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MiniChart from '../components/common/MiniChart';
import {
  BookOpen,
  Calendar,
  Download,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  PieChart,
  Tag,
  Filter
} from 'lucide-react';

export default function JournalView() {
  const { journalTrades, addTrade, deleteTrade, importTrades } = useMarketData();
  const { user, isAuthenticated } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [filterSide, setFilterSide] = useState('all'); // 'all' | 'long' | 'short'
  const [filterTag, setFilterTag] = useState('all');

  const [newTrade, setNewTrade] = useState({
    sym: '',
    side: 'long',
    qty: '',
    entry: '',
    exit: '',
    from: todayStr,
    to: todayStr,
    tag: '',
    note: ''
  });

  const calculatePnl = (t) => {
    const entry = parseFloat(t.entry) || 0;
    const exit = parseFloat(t.exit) || 0;
    const qty = parseFloat(t.qty) || 0;
    const mult = t.side === 'long' ? 1 : -1;
    return (exit - entry) * qty * mult;
  };

  // Performance stats
  const stats = useMemo(() => {
    let totalPnl = 0;
    const wins = [];
    const losses = [];
    const tagMap = new Map();
    const equityCurve = [0];

    // Calculate in chronological order
    const sortedChronological = [...journalTrades].reverse();
    let running = 0;
    for (const t of sortedChronological) {
      const p = calculatePnl(t);
      running += p;
      equityCurve.push(running);
    }

    for (const t of journalTrades) {
      const pnl = calculatePnl(t);
      totalPnl += pnl;

      if (pnl > 0) wins.push(pnl);
      else if (pnl < 0) losses.push(pnl);

      const tag = t.tag?.trim() || 'Untagged';
      const cur = tagMap.get(tag) || { count: 0, wins: 0, net: 0 };
      cur.count += 1;
      if (pnl > 0) cur.wins += 1;
      cur.net += pnl;
      tagMap.set(tag, cur);
    }

    const winRate = journalTrades.length > 0 ? (wins.length / journalTrades.length) * 100 : 0;
    const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0)) / losses.length : 0;
    const profitFactor = avgLoss > 0 ? (wins.reduce((a, b) => a + b, 0) / (losses.reduce((a, b) => Math.abs(a) + Math.abs(b), 0) || 1)) : wins.length > 0 ? 99 : 0;

    return {
      totalPnl,
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      equityCurve,
      tags: [...tagMap.entries()].sort((a, b) => b[1].net - a[1].net)
    };
  }, [journalTrades]);

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(() => todayStr.slice(0, 7)); // 'YYYY-MM'
  const [year, month] = calendarMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Monday = 0

  const dailyPnlMap = useMemo(() => {
    const map = new Map();
    for (const t of journalTrades) {
      const day = t.to || t.from;
      const pnl = calculatePnl(t);
      map.set(day, (map.get(day) || 0) + pnl);
    }
    return map;
  }, [journalTrades]);

  const monthTradesPnl = useMemo(() => {
    let sum = 0;
    dailyPnlMap.forEach((val, day) => {
      if (day.startsWith(calendarMonth)) sum += val;
    });
    return sum;
  }, [dailyPnlMap, calendarMonth]);

  const maxDailyPnl = Math.max(1, ...Array.from(dailyPnlMap.values()).map(Math.abs));

  const changeMonth = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleAddTrade = (e) => {
    e.preventDefault();
    if (!newTrade.sym || !newTrade.qty || !newTrade.entry || !newTrade.exit) return;

    const trade = {
      id: String(Date.now()),
      sym: newTrade.sym.trim().toUpperCase(),
      side: newTrade.side,
      qty: parseFloat(newTrade.qty),
      entry: parseFloat(newTrade.entry),
      exit: parseFloat(newTrade.exit),
      from: newTrade.from || todayStr,
      to: newTrade.to || newTrade.from || todayStr,
      tag: newTrade.tag.trim() || 'General',
      note: newTrade.note.trim()
    };

    addTrade(trade);
    setNewTrade({
      sym: '',
      side: newTrade.side,
      qty: '',
      entry: '',
      exit: '',
      from: todayStr,
      to: todayStr,
      tag: newTrade.tag,
      note: ''
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const header = ['symbol', 'side', 'qty', 'entry', 'exit', 'from', 'to', 'tag', 'note', 'pnl'];
    const rows = journalTrades.map(t => [
      t.sym,
      t.side,
      t.qty,
      t.entry,
      t.exit,
      t.from,
      t.to,
      t.tag,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      calculatePnl(t).toFixed(2)
    ]);
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tredye-journal-${todayStr}.csv`;
    a.click();
  };

  // CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(Boolean);
        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length >= 6) {
            imported.push({
              id: String(Date.now() + i),
              sym: cols[0]?.trim().toUpperCase(),
              side: cols[1]?.trim().toLowerCase() === 'short' ? 'short' : 'long',
              qty: parseFloat(cols[2]) || 1,
              entry: parseFloat(cols[3]) || 0,
              exit: parseFloat(cols[4]) || 0,
              from: cols[5]?.trim() || todayStr,
              to: cols[6]?.trim() || cols[5]?.trim() || todayStr,
              tag: cols[7]?.trim() || 'Imported',
              note: cols[8]?.replace(/"/g, '').trim() || ''
            });
          }
        }
        if (imported.length > 0) {
          importTrades(imported);
        }
      } catch (err) {
        console.error('Import failed', err);
      }
    };
    reader.readAsText(file);
  };

  // Filtered trades list
  const filteredTrades = journalTrades.filter(t => {
    const sideMatch = filterSide === 'all' || t.side === filterSide;
    const tagMatch = filterTag === 'all' || t.tag === filterTag;
    return sideMatch && tagMatch;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-up animate-ping" />
            <span className="text-xs font-bold text-brand tracking-wider uppercase">
              Trading Journal &amp; Edge Analytics
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            {journalTrades.length > 0 ? (
              <>
                Your Journal: {journalTrades.length} trades,{' '}
                <span className={stats.totalPnl >= 0 ? 'text-up' : 'text-down'}>
                  {stats.totalPnl >= 0 ? '+' : ''}₹{stats.totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </>
            ) : (
              'Log trades, see what actually pays'
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Private, client-side encrypted analytics. Track win rate, expectancy, and setup ROI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isAuthenticated ? 'live' : 'sim'}>
            {isAuthenticated ? 'Cloud Synced' : 'Saved in this browser only'}
          </Badge>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <label className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Net P&L */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Net Realized P&amp;L</span>
          <div className={`mt-1 font-mono text-2xl font-bold ${stats.totalPnl >= 0 ? 'text-up' : 'text-down'}`}>
            {stats.totalPnl >= 0 ? '+' : ''}₹{stats.totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 pt-1 border-t border-hairline/60">
            <MiniChart data={stats.equityCurve} color={stats.totalPnl >= 0 ? '#16a34a' : '#dc2626'} height={26} />
          </div>
        </div>

        {/* Win Rate */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Win Rate</span>
          <div className="mt-1 font-mono text-2xl font-bold text-foreground">
            {stats.winRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-muted-foreground font-mono font-medium block mt-1">
            Profit Factor: <strong className="text-foreground">{stats.profitFactor.toFixed(2)}</strong>
          </span>
        </div>

        {/* Avg Win */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Average Win</span>
          <div className="mt-1 font-mono text-2xl font-bold text-up">
            +₹{stats.avgWin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono font-medium block mt-1">
            Gain on winning setups
          </span>
        </div>

        {/* Avg Loss */}
        <div className="rounded-2xl border border-hairline bg-surface-card p-4 shadow-card">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">Average Loss</span>
          <div className="mt-1 font-mono text-2xl font-bold text-down">
            -₹{stats.avgLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono font-medium block mt-1">
            Risk:Reward ratio
          </span>
        </div>
      </div>

      {/* Grid: Log Trade Form & P&L Calendar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Log a Trade Form (lg:col-span-5) */}
        <Card
          className="lg:col-span-5"
          title="Log a Trade Execution"
          icon={Plus}
          info="Symbol, side, quantity, entry and exit. Trades held over several days take a From and a To date; P&L counts on the To day."
        >
          <form onSubmit={handleAddTrade} className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Symbol</label>
                <input
                  type="text"
                  placeholder="SBIN, NIFTY..."
                  value={newTrade.sym}
                  onChange={e => setNewTrade({ ...newTrade, sym: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 uppercase font-mono font-bold text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Side</label>
                <select
                  value={newTrade.side}
                  onChange={e => setNewTrade({ ...newTrade, side: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-bold text-foreground outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                >
                  <option value="long" className="bg-surface-card text-foreground">Long (Buy)</option>
                  <option value="short" className="bg-surface-card text-foreground">Short (Sell)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Quantity</label>
                <input
                  type="number"
                  placeholder="e.g. 75"
                  value={newTrade.qty}
                  onChange={e => setNewTrade({ ...newTrade, qty: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Setup Tag</label>
                <input
                  type="text"
                  placeholder="Order block, VWAP..."
                  value={newTrade.tag}
                  onChange={e => setNewTrade({ ...newTrade, tag: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Entry Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Entry"
                  value={newTrade.entry}
                  onChange={e => setNewTrade({ ...newTrade, entry: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Exit Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Exit"
                  value={newTrade.exit}
                  onChange={e => setNewTrade({ ...newTrade, exit: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">From Date</label>
                <input
                  type="date"
                  value={newTrade.from}
                  onChange={e => setNewTrade({ ...newTrade, from: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-foreground outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">To Date (Exit)</label>
                <input
                  type="date"
                  value={newTrade.to}
                  onChange={e => setNewTrade({ ...newTrade, to: e.target.value })}
                  className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 font-mono text-foreground outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Trade Notes (Optional)</label>
              <input
                type="text"
                placeholder="Market context, emotions, psychology..."
                value={newTrade.note}
                onChange={e => setNewTrade({ ...newTrade, note: e.target.value })}
                className="w-full rounded-xl border border-hairline bg-surface-2 px-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-xl bg-brand py-2.5 font-bold text-white shadow-glow hover:bg-brand-deep active:scale-98 transition-all"
            >
              Add Trade to Journal
            </button>
          </form>
        </Card>

        {/* P&L Calendar (lg:col-span-7) */}
        <Card
          className="lg:col-span-7"
          title="P&amp;L Performance Calendar"
          icon={Calendar}
          info="Each day coloured by its realised P&L: deeper green or red means a bigger day. Hover over days to see details."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-heading text-xs font-bold text-foreground">
                {new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
          status={
            <span className={`font-mono text-xs font-bold ${monthTradesPnl >= 0 ? 'text-up' : 'text-down'}`}>
              Month: {monthTradesPnl >= 0 ? '+' : ''}₹{monthTradesPnl.toFixed(0)}
            </span>
          }
        >
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <span key={day} className="py-1 text-[11px] font-bold text-muted-foreground uppercase">
                {day}
              </span>
            ))}

            {/* Empty offset padding */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-xl border border-hairline/30 bg-surface-2/20" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${calendarMonth}-${String(dayNum).padStart(2, '0')}`;
              const pnl = dailyPnlMap.get(dateStr);
              const hasPnl = pnl !== undefined;
              const isProfit = (pnl || 0) >= 0;
              const intensity = hasPnl ? Math.min(100, Math.round((Math.abs(pnl) / maxDailyPnl) * 100)) : 0;

              return (
                <div
                  key={dateStr}
                  title={hasPnl ? `${dateStr}: ${isProfit ? '+' : ''}₹${pnl.toFixed(2)}` : dateStr}
                  className="flex aspect-square flex-col items-center justify-center rounded-xl border border-hairline text-[11px] transition-transform hover:scale-105 shadow-sm"
                  style={
                    hasPnl
                      ? {
                          backgroundColor: isProfit
                            ? `rgba(22, 163, 74, ${0.18 + (intensity / 100) * 0.55})`
                            : `rgba(220, 38, 38, ${0.18 + (intensity / 100) * 0.55})`
                        }
                      : { backgroundColor: 'var(--surface-2)' }
                  }
                >
                  <span className="font-bold text-foreground">{dayNum}</span>
                  {hasPnl && (
                    <span className="font-mono text-[9px] font-bold text-foreground">
                      {isProfit ? '+' : ''}₹{Math.abs(pnl) >= 1000 ? `${(pnl / 1000).toFixed(1)}k` : pnl.toFixed(0)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Grid: By Setup Analysis & Trades Table */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Setup Analysis (lg:col-span-4) */}
        <Card
          className="lg:col-span-4"
          title="Performance by Setup Tag"
          icon={Tag}
          info="Which setups actually make money: compares win rate, trade frequency, and net P&L per tag."
        >
          {stats.tags.length > 0 ? (
            <ul className="divide-y divide-hairline text-xs font-mono">
              {stats.tags.map(([tag, data]) => {
                const winPct = Math.round((data.wins / data.count) * 100);
                return (
                  <li key={tag} className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="font-bold text-foreground">{tag}</span>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {data.count} trades · {winPct}% wins
                      </p>
                    </div>
                    <span className={`font-bold ${data.net >= 0 ? 'text-up' : 'text-down'}`}>
                      {data.net >= 0 ? '+' : ''}₹{data.net.toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No tagged trades yet. Tag your setups to compare edge.
            </div>
          )}
        </Card>

        {/* Trades Table (lg:col-span-8) */}
        <Card
          className="lg:col-span-8"
          title={`All Trades (${filteredTrades.length})`}
          icon={BookOpen}
          actions={
            <div className="flex items-center gap-2">
              <select
                value={filterSide}
                onChange={e => setFilterSide(e.target.value)}
                className="rounded-lg border border-hairline bg-surface-2 px-2 py-1 text-xs text-foreground outline-none font-medium cursor-pointer"
              >
                <option value="all">All Sides</option>
                <option value="long">Longs Only</option>
                <option value="short">Shorts Only</option>
              </select>
            </div>
          }
        >
          {filteredTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-hairline text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-2.5">Symbol</th>
                    <th className="py-2.5 px-2.5">Side</th>
                    <th className="py-2.5 px-2.5 text-right">Qty</th>
                    <th className="py-2.5 px-2.5 text-right">Entry</th>
                    <th className="py-2.5 px-2.5 text-right">Exit</th>
                    <th className="py-2.5 px-2.5 text-center">Dates</th>
                    <th className="py-2.5 px-2.5">Setup</th>
                    <th className="py-2.5 px-2.5 text-right">Realized P&amp;L</th>
                    <th className="py-2.5 px-2.5 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {filteredTrades.map((t) => {
                    const pnl = calculatePnl(t);
                    return (
                      <tr key={t.id} title={t.note} className="hover:bg-surface-2 transition-colors">
                        <td className="py-2.5 px-2.5 font-bold text-foreground">{t.sym}</td>
                        <td className="py-2.5 px-2.5 uppercase font-semibold text-muted-foreground">{t.side}</td>
                        <td className="py-2.5 px-2.5 text-right text-foreground">{t.qty}</td>
                        <td className="py-2.5 px-2.5 text-right text-foreground">₹{t.entry}</td>
                        <td className="py-2.5 px-2.5 text-right text-foreground">₹{t.exit}</td>
                        <td className="py-2.5 px-2.5 text-center text-muted-foreground text-[11px] font-medium">
                          {t.from === t.to ? t.to : `${t.from} → ${t.to}`}
                        </td>
                        <td className="py-2.5 px-2.5 text-brand font-medium">{t.tag}</td>
                        <td className={`py-2.5 px-2.5 text-right font-bold ${pnl >= 0 ? 'text-up' : 'text-down'}`}>
                          {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <button
                            onClick={() => deleteTrade(t.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-down/15 hover:text-down transition-colors"
                            title="Delete trade"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Your journal is empty. Add your first trade using the form on the left!
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
