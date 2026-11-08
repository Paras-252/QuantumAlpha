import React from 'react';

export default function QuantumAlphaLogo({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: { container: 'h-7 w-7 rounded-lg', icon: 'h-4.5 w-4.5' },
    md: { container: 'h-8 w-8 rounded-xl', icon: 'h-5 w-5' },
    lg: { container: 'h-11 w-11 rounded-2xl', icon: 'h-7 w-7' },
    xl: { container: 'h-14 w-14 rounded-2xl', icon: 'h-9 w-9' }
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1.5px] shadow-[0_0_18px_rgba(6,182,212,0.4)] transition-transform duration-200 group-hover:scale-105 ${current.container} ${className}`}
    >
      <div className="flex h-full w-full items-center justify-center rounded-[inherit] bg-surface-card/95 backdrop-blur-md">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${current.icon}`}
        >
          <defs>
            <linearGradient id="qaLogoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="60%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="qaOrbitGrad" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Tilted Quantum Orbit Ring */}
          <ellipse
            cx="12"
            cy="12"
            rx="9.5"
            ry="4"
            transform="rotate(-30 12 12)"
            stroke="url(#qaOrbitGrad)"
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />

          {/* Quantum Alpha Glyph (α) */}
          <path
            d="M6 16.5C7.5 15.2 9.2 13 11 9.8C12.5 7.2 14.5 5.5 16.8 5.5C19 5.5 20.2 7.2 20.2 9.5C20.2 12.8 17.5 16.8 12.5 16.8C9.5 16.8 7.2 14.5 7.2 11.5C7.2 8.5 9.5 6.5 12.5 6.5C14.8 6.5 17 8 18.5 10.5L20 13.5L21.5 16.5"
            stroke="url(#qaLogoGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Core Quantum Spark */}
          <circle cx="12" cy="11.5" r="1.3" fill="#22D3EE" />
          {/* Orbital Satellite Node */}
          <circle cx="19.5" cy="8" r="1.1" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
}
