import React from 'react';

export default function Badge({
  children,
  tone = 'neutral', // 'live' | 'closed' | 'sim' | 'up' | 'down' | 'neutral' | 'warn'
  icon,
  dot = false,
  className = ''
}) {
  const toneClasses = {
    live: 'bg-up/12 text-up border-up/25',
    closed: 'bg-surface-muted text-foreground-secondary border-hairline',
    sim: 'bg-brand/12 text-brand border-brand/25',
    up: 'bg-up/12 text-up border-up/25',
    down: 'bg-down/12 text-down border-down/25',
    neutral: 'bg-surface-2 text-foreground-secondary border-hairline',
    warn: 'bg-warn/12 text-warn border-warn/25',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight select-none ${
        toneClasses[tone] || toneClasses.neutral
      } ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {icon}
      <span>{children}</span>
    </span>
  );
}

