import React, { useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Newspaper,
  Tag,
  Clock,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

export default function NewsView() {
  const { news, setSelectedOptionSymbol, setCurrentScreen, marketStatus } = useMarketData();
  const [filterCat, setFilterCat] = useState('ALL');

  const categories = ['ALL', 'SECTOR', 'INSTITUTIONAL', 'EARNINGS', 'REGULATORY', 'MACRO'];

  const filteredNews = filterCat === 'ALL'
    ? news
    : news.filter(n => n.category === filterCat);

  const handleOpenOption = (sym) => {
    setSelectedOptionSymbol(sym);
    setCurrentScreen('options');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
            <span className="text-xs font-bold text-brand tracking-wider uppercase">
              Financial Wire &amp; Catalysts
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Market News &amp; F&amp;O Catalysts
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Breaking market headlines, institutional filings, block trade alerts, and regulatory circulars.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                filterCat === cat
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-surface-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <Card
        title={`Latest Catalysts (${filteredNews.length} items)`}
        icon={Newspaper}
        status={<Badge tone={marketStatus === 'Live' ? 'live' : 'closed'} dot={marketStatus === 'Live'}>
          {marketStatus === 'Live' ? 'Live Wire' : 'Closing Wire'}
        </Badge>}
      >
        <div className="space-y-3">
          {filteredNews.map(item => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-2 p-4 transition-colors hover:border-hairline/80 hover:bg-surface-muted/40 shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-muted-foreground font-semibold">{item.time}</span>
                  <Badge tone={item.sentiment === 'BULLISH' ? 'up' : item.sentiment === 'BEARISH' ? 'down' : 'neutral'}>
                    {item.sentiment}
                  </Badge>
                  <span className="rounded-md bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-subtle-foreground uppercase">
                    {item.category}
                  </span>
                </div>

                <h3 className="font-heading text-sm font-bold text-foreground">
                  {item.title}
                </h3>

                <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground font-medium">
                  <span>Source: <strong className="text-foreground">{item.source}</strong></span>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand hover:underline"
                    >
                      <span>Read Wire</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Ticker Badges */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {(item.tickers || ['NIFTY']).map(sym => (
                  <button
                    key={sym}
                    onClick={() => handleOpenOption(sym)}
                    className="rounded-lg border border-hairline bg-surface-card px-2.5 py-1 font-mono text-[11px] font-bold text-brand hover:bg-brand hover:text-white transition-colors"
                  >
                    {sym} &rarr;
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
