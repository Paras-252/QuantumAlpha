import React from 'react';
import { Info } from 'lucide-react';

export default function Card({
  title,
  icon: Icon,
  info,
  status,
  legend,
  actions,
  insight,
  children,
  className = '',
  bodyClassName = ''
}) {
  return (
    <section
      className={`relative flex flex-col rounded-2xl border border-hairline bg-surface-card p-4 sm:p-5 shadow-card transition-all duration-150 ${className}`}
    >
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-2 text-brand border border-hairline/40">
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <h2 className="font-heading text-sm font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {info && (
            <div className="group/tooltip relative inline-flex items-center">
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-64 rounded-xl border border-hairline bg-surface-muted p-2.5 text-[11.5px] leading-relaxed text-foreground shadow-2xl z-50 group-hover/tooltip:block backdrop-blur-md">
                {info}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {legend}
          {status}
          {actions}
        </div>
      </div>

      {/* Insight banner if provided */}
      {insight && (
        <div className="mb-3 rounded-xl border border-hairline/60 bg-surface-2 px-3 py-2 text-xs text-foreground-secondary flex items-center gap-2">
          {insight}
        </div>
      )}

      {/* Card Content Body */}
      <div className={`flex-1 text-foreground ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
