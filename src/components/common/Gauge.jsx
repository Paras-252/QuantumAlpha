import React from 'react';

export default function Gauge({
  value = 50,
  min = 0,
  max = 100,
  label,
  sublabel,
  zones = [
    { from: 0, to: 30, color: '#dc2626', label: 'Extreme Fear' },
    { from: 30, to: 50, color: '#f59e0b', label: 'Fear' },
    { from: 50, to: 70, color: '#4f46e5', label: 'Balanced' },
    { from: 70, to: 100, color: '#16a34a', label: 'Greed' }
  ],
  endLabels = ['Risk-off', 'Risk-on'],
  className = ''
}) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped - min) / (max - min);
  // Angle: -90 deg (left) to +90 deg (right) -> 180 degree arc
  const angle = -90 + pct * 180;

  // Arc path constants
  const cx = 100;
  const cy = 95;
  const r = 70;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative w-48 sm:w-56 h-28 flex items-end justify-center">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          {/* Background Arc */}
          <path
            d="M 30 95 A 70 70 0 0 1 170 95"
            fill="none"
            stroke="var(--surface-muted)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Color Arc Segments */}
          {/* Red Zone (Risk Off) */}
          <path
            d="M 30 95 A 70 70 0 0 1 70 38"
            fill="none"
            stroke="#dc2626"
            strokeWidth="14"
            opacity="0.8"
          />
          {/* Neutral / Brand Zone */}
          <path
            d="M 70 38 A 70 70 0 0 1 130 38"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="14"
            opacity="0.8"
          />
          {/* Green Zone (Risk On) */}
          <path
            d="M 130 38 A 70 70 0 0 1 170 95"
            fill="none"
            stroke="#16a34a"
            strokeWidth="14"
            opacity="0.8"
          />

          {/* Needle Pointer */}
          <g transform={`rotate(${angle} ${cx} ${cy})`} className="transition-transform duration-500 ease-out">
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - 64}
              stroke="var(--foreground)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="6" fill="var(--foreground)" />
            <circle cx={cx} cy={cy} r="2.5" fill="var(--surface)" />
          </g>
        </svg>

        {/* Center Value */}
        <div className="absolute bottom-0 flex flex-col items-center translate-y-1">
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground font-mono">
            {label !== undefined ? label : value}
          </span>
          {sublabel && (
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {/* End Labels */}
      {endLabels && (
        <div className="flex w-48 sm:w-56 justify-between text-[11px] text-subtle-foreground px-1 mt-1 font-medium">
          <span>{endLabels[0]}</span>
          <span>{endLabels[1]}</span>
        </div>
      )}
    </div>
  );
}

