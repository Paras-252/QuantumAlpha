# Quantum Alpha Pro Terminal 🚀

A high-performance visual intelligence and analytics dashboard for Indian NSE F&O markets, Zerodha Kite WebSocket live tick streaming, trading journal, and derivatives tools.

---

## 🌟 Implemented Features & Modules

### 1. 🔐 Complete Authentication & User System (Pre-loaded & 1-Click Login)
* **Authenticated Mode by Default**: Access all protected screens and live market data APIs.
* **1-Click Instant Demo Login**: Switch between Pro Trader and Guest modes.
* **Account Dropdown**: User profile, plan badge (`Pro Terminal Active`), settings shortcut, and sign-out.

---

### 2. ⚡ Live Market Pulse (`/pulse/`)
* **Core NSE Indices**: NIFTY 50, BANKNIFTY, FINNIFTY, MIDCPNIFTY with live quotes, day range bars, directional bias (`BULLISH`/`BEARISH`/`NEUTRAL`), and interactive sparklines.
* **Money Flow Ribbon**: Animated capital flow visualizer showing sector outflow (left in red), net flow (center in blue), and inflow (right in green).
* **Market Mood Gauge (0–100)**: Composite index driven by Adv/Dec breadth, money flow, Nifty momentum score, and India VIX.
* **India VIX & Percentile**: 30-day volatility percentile and expected daily NIFTY range (±%).
* **Sector Treemap Heatmap**: Proportional tile sizing by turnover (₹ cr) with color-intensity scaling (-4% to +4%).

---

### 3. 🎯 Option Pulse & Greek Analytics (`/options/`)
* **Underlying & Expiry Selectors**: NIFTY 50, BANKNIFTY, FINNIFTY, and leading F&O equities across weekly/monthly series.
* **Algorithmic Verdict Banner**: Real-time identification of institutional Call Resistance Walls and Put Support Walls.
* **Key Metrics**: Spot Price, Max Pain Strike, ATM Straddle Price, ATM Implied Volatility (IV), and Put-Call Ratio (PCR).
* **Visual Option Chain**: Horizontal comparative Call OI vs Put OI bars with today's OI change and highlighted wall levels.
* **Put-Call Ratio (PCR) Gauge**: Zones for Call-heavy (<0.7), Balanced (0.7–1.2), and Put-heavy (>1.2) with Δ-PCR tracking.
* **IV Smile & Skew Curve**: Displays put skew vs call IV by strike to reveal institutional downside hedging demand.
* **Full Chain & Greeks Modal Table**: Complete strike ladder with Delta, Gamma, Theta, Vega, IV, LTP, OI, and OI Change.

---

### 4. 📊 Open Interest (OI) Flow Quadrants (`/oi-flow/`)
* **4 Core Quadrants**:
  1. **Long Build-up (Green)**: Price ↑, OI ↑ (Aggressive institutional buying)
  2. **Short Covering (Cyan)**: Price ↑, OI ↓ (Shorts forced to cover)
  3. **Short Build-up (Red)**: Price ↓, OI ↑ (Fresh bearish short pressure)
  4. **Long Unwinding (Amber)**: Price ↓, OI ↓ (Bulls taking profit)
* Quadrant filter tabs and quick links to open Option Chains.

---

### 5. 💧 Liquidity Map & Order Flow (`/liquidity/`)
* **Large Block Trades Feed**: Real-time ticker tracking trades > ₹3 Cr with execution price, volume, and aggression label (e.g. *Buyer Lifted Ask*, *Seller Hit Bid*).
* **VWAP Deviation Monitor**: Measures intraday stretch above/below Volume Weighted Average Price for mean-reversion setups.

---

### 6. 🏆 Strength Boards (`/strength/`)
* **Relative Strength (RS) vs NIFTY 50**: Classifies sectors into Leading, Improving, Weakening, and Lagging quadrants.
* Leaderboard ranking sectors by excess alpha.

---

### 7. 🔍 Technical & Quantitative Screeners (`/screeners/`)
* **Futures Basis Screener**: Cash-carry arbitrage yields and roll costs.
* **Multi-Timeframe RSI Screener**: Confluence alignment across 15m, 1h, Daily, and Weekly charts.
* **IV Rank & Percentile Screener**: Highlights rich vs cheap options for option selling vs directional buying.

---

### 8. 📡 Stock Radar & Watchlist (`/radar/`)
* Dynamic surveillance watchlist tracking volume multipliers (>1.5x), ATH probes, and breakdowns.
* Favorite toggle (★) and custom ticker addition.

---

### 9. 📓 Private Trading Journal (`/journal/`)
* **100% Client-Side Privacy**: Persisted in `localStorage` (`tredye.journal.v1`) with instant CSV Export (`tredye-journal.csv`) and CSV Import.
* **P&L Performance Calendar**: Color-coded daily heatmap with deeper green/red shades for larger P&L sessions.
* **Trade Execution Logger**: Symbol, side (Long/Short), quantity, entry, exit, dates, setup tag, and notes.
* **Analytics**: Net P&L, Win Rate %, Average Win, Average Loss, Profit Factor, and Setup tag ROI breakdown.

---

### 10. 🧘 Calm Zone (`/calm/`)
* **Interactive 4-4-4-4 Box Breathing Visualizer**: Guided animated sphere for sympathetic nervous system regulation.
* **Pre-Execution Discipline Checklist**: 5-point psychological self-audit to prevent FOMO and revenge trading.

---

### 11. 📰 Market News Wire (`/news/`)
* Filtered catalysts (Sector, Institutional, Earnings, Regulatory, Macro) with sentiment tags.
* Instant price alert catalysts and breaking market updates.

---

### 12. ⚡ Zerodha Kite Connect Live Tick-by-Tick Engine
* **Sub-50ms WebSocket Streaming**: Direct binary `ArrayBuffer` parser (`src/services/kiteTicker.js`) for 8-byte LTP, 44-byte Quote, and 184-byte Full Depth & OI packets.
* **5-Level Order Book (Market Depth)**: Real-time top 5 bids & asks with quantities and order counts for Cumulative Volume Delta (CVD) and institutional liquidity walls.
* **GoDaddy Static IP Relay (`server.js`)**: Solves JioFiber/Airtel dynamic IP changes against Zerodha's 7–10 day whitelist restriction by proxying WebSockets through GoDaddy's permanent server IP.
* **Off-Hours / Weekend Simulation Engine**: Built-in 500ms test tick generator for after-market testing and algorithmic verification.

---

### 13. 🎓 F&O Academy (`/academy/`)
* 5 structured educational modules from beginner options to advanced order flow.
* **Interactive Options Payoff Simulator**: Real-time slider-based P&L curves for Short Straddles, Long Calls, and Iron Condors.

---

### 14. ⌨️ Global UX Enhancements
* **Global Search Command Palette (`Ctrl + K`)**: Instant keyboard search across all terminal screens and stocks.
* **Presentation Mode**: Auto-rotates through screens with customizable timer and visual progress bar.
* **Theme Switcher**: Dark Mode and Light Mode with seamless transitions and optimized high-contrast typography.
* **Web Audio Sound Effects**: Synthesized audio chimes for trade entries and alerts.
* **NSE Market Status Badge**: Live/Closed indicator with pulsing dot.

---

## 🛠️ Tech Stack
- **Framework**: React 18, Vite 6
- **Styling**: Tailwind CSS, Outfit & Inter & JetBrains Mono typography
- **Icons**: Lucide React
- **State & Storage**: React Context + LocalStorage persistence

---

## 🏃 Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
Access the application locally at **`http://localhost:3000`**.

