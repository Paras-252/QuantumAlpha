/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        brand: {
          DEFAULT: 'var(--brand)',
          glow: 'var(--brand-glow)',
          deep: 'var(--brand-deep)',
          light: '#818cf8',
        },
        foreground: 'var(--foreground)',
        'foreground-secondary': 'var(--foreground-secondary)',
        'muted-foreground': 'var(--muted-foreground)',
        'subtle-foreground': 'var(--subtle-foreground)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          'muted-2': 'var(--surface-muted-2)',
          raised: 'var(--surface-raised)',
          card: 'var(--surface-card)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        hairline: 'var(--hairline)',
        'hairline-strong': 'var(--hairline-strong)',
        border: 'var(--border)',
        up: {
          DEFAULT: 'rgb(var(--up-rgb, 34 197 94) / <alpha-value>)',
          soft: 'rgba(34, 197, 94, 0.12)',
        },
        down: {
          DEFAULT: 'rgb(var(--down-rgb, 239 68 68) / <alpha-value>)',
          soft: 'rgba(239, 68, 68, 0.12)',
        },
        flat: 'var(--flat)',
        warn: {
          DEFAULT: 'var(--warn)',
          soft: 'rgba(245, 158, 11, 0.12)',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        header: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: 'var(--shadow-card)',
        control: 'var(--shadow-control)',
        glow: '0 0 24px -4px var(--brand-glow)',
      }
    },
  },
  plugins: [],
}
