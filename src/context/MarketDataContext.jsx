import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ACTUAL_CLOSING_INDICES,
  INITIAL_VIX,
  INITIAL_MARKET_MOOD,
  SECTORS,
  OPTIONS_SYMBOLS,
  EXPIRIES,
  generateOptionChain,
  OI_FLOW_DATA,
  LIQUIDITY_TRADES,
  SCREENERS_DATA,
  RADAR_ITEMS,
  NEWS_ITEMS,
  DEFAULT_JOURNAL_TRADES,
  getNSEMarketHours,
  FLOW_FEED,
  ORDERFLOW_FEED
} from '../data/marketData';
import { MarketFeedService } from '../services/marketFeed';
import { KiteTickerService, KITE_TOKENS } from '../services/kiteTicker';

const MarketDataContext = createContext();

export function MarketDataProvider({ children }) {
  const [pulseView, setPulseView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'flow' || v === 'orderflow' || v === 'overview') return v;
    } catch (e) {}
    return 'overview';
  });

  const [currentScreen, setCurrentScreen] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'flow' || v === 'orderflow') return 'pulse';
    } catch (e) {}
    return 'pulse';
  });

  const changePulseView = (view) => {
    setPulseView(view);
    setCurrentScreen('pulse');
    try {
      const url = new URL(window.location.href);
      if (view === 'overview') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', view);
      }
      window.history.replaceState(null, '', url.pathname + url.search);
    } catch (e) {}
  };

  // Sync with browser back/forward and direct URL queries
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const v = params.get('view');
        if (v === 'flow' || v === 'orderflow' || v === 'overview') {
          setPulseView(v);
          setCurrentScreen('pulse');
        }
      } catch (e) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [theme, setTheme] = useState(() => localStorage.getItem('tredye.theme') || 'dark');
  
  // Market timing: Live vs Closed
  const initialMarketHours = getNSEMarketHours();
  const [marketStatus, setMarketStatus] = useState(initialMarketHours.status || "Closed"); // "Live" | "Closed"
  const [marketSubtext, setMarketSubtext] = useState(initialMarketHours.subtext);
  const [isLiveSimulating, setIsLiveSimulating] = useState(initialMarketHours.isOpen);

  // Periodically re-evaluate NSE market hours (IST)
  useEffect(() => {
    const checkHours = () => {
      const h = getNSEMarketHours();
      setMarketStatus(h.status || "Closed");
      setMarketSubtext(h.subtext);
    };
    const timer = setInterval(checkHours, 30000);
    return () => clearInterval(timer);
  }, []);

  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationInterval, setPresentationInterval] = useState(20); // 20s
  const [presentationProgress, setPresentationProgress] = useState(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Market states initialized with authentic NSE closing quotes
  const [indices, setIndices] = useState(ACTUAL_CLOSING_INDICES);
  const [vix, setVix] = useState(INITIAL_VIX);
  const [mood, setMood] = useState(INITIAL_MARKET_MOOD);
  const [sectors, setSectors] = useState(SECTORS);
  const [selectedOptionSymbol, setSelectedOptionSymbol] = useState("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState(EXPIRIES[0]);
  const [optionData, setOptionData] = useState(() => generateOptionChain("NIFTY", EXPIRIES[0]));
  const [oiFlowData, setOiFlowData] = useState(OI_FLOW_DATA);
  const [liquidityTrades, setLiquidityTrades] = useState(LIQUIDITY_TRADES);
  const [screeners, setScreeners] = useState(SCREENERS_DATA);
  const [radarItems, setRadarItems] = useState(RADAR_ITEMS);
  const [news, setNews] = useState(NEWS_ITEMS);

  // --- Zerodha Kite Connect State ---
  const [isZerodhaModalOpen, setIsZerodhaModalOpen] = useState(false);
  const [isZerodhaLive, setIsZerodhaLive] = useState(() => {
    return localStorage.getItem('tredye.zerodha.enabled') === 'true';
  });
  const [zerodhaConfig, setZerodhaConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('tredye.zerodha.config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_KITE_API_KEY) || '',
      accessToken: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_KITE_ACCESS_TOKEN) || '',
      mode: 'full',
      connectionMode: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_KITE_CONNECTION_MODE) || 'relay',
      relayHost: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_KITE_RELAY_HOST) || ''
    };
  });
  const [zerodhaStatus, setZerodhaStatus] = useState('DISCONNECTED');
  const [zerodhaStatusMessage, setZerodhaStatusMessage] = useState('');
  const [zerodhaStats, setZerodhaStats] = useState({
    ticksCount: 0,
    packetsCount: 0,
    bytesReceived: 0,
    lastTickTime: null,
    lastTicks: []
  });
  const [isKiteSimulating, setIsKiteSimulating] = useState(false);

  const kiteServiceRef = useRef(null);

  // Background Live Sync with official Tredye / NSE feeds when online
  useEffect(() => {
    let isMounted = true;
    const fetchLivePulse = async () => {
      try {
        const res = await fetch('https://data.tredye.com/data/pulse.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const d = await res.json();
        if (!isMounted || !d) return;

        // Only overwrite indices if Zerodha Live is not active
        if (!isZerodhaLive && !isKiteSimulating) {
          if (d.indices && d.indices.length >= 2) {
            setIndices(prev => [
              {
                ...prev[0],
                ltp: d.indices[0].spot,
                change: +d.indices[0].chg.toFixed(2),
                pChange: +d.indices[0].chg_pct.toFixed(2),
                bias: d.indices[0].bias,
                range: d.indices[0].range,
                walls: d.indices[0].walls,
                sparkline: d.indices[0].spark?.c?.slice(-25) || prev[0].sparkline
              },
              {
                ...prev[1],
                ltp: d.indices[1].spot,
                change: +d.indices[1].chg.toFixed(2),
                pChange: +d.indices[1].chg_pct.toFixed(2),
                bias: d.indices[1].bias,
                range: d.indices[1].range,
                walls: d.indices[1].walls,
                sparkline: d.indices[1].spark?.c?.slice(-25) || prev[1].sparkline
              },
              prev[2],
              prev[3]
            ]);
          }

          if (d.vix) {
            setVix(prev => ({
              ...prev,
              ltp: d.vix.last,
              change: d.vix.chg,
              pChange: d.vix.chg_pct,
              pctile: Math.round(d.vix.pctile),
              expected_nifty_daily_move: d.vix.nifty_daily_move_pct
            }));
          }
        }

        if (d.mood) {
          setMood(prev => ({
            ...prev,
            score: Math.round(d.mood.score),
            label: `${d.mood.label} (Bullish Tape)`,
            headline: d.headline,
            breadthScore: d.mood.parts.breadth,
            flowScore: d.mood.parts.flow,
            niftyScore: d.mood.parts.nifty,
            vixScore: d.mood.parts.vix,
            advancers: d.adv,
            decliners: d.dec,
            inflow: Math.round(d.inflow),
            outflow: Math.round(Math.abs(d.outflow)),
            netFlow: Math.round(d.inflow - Math.abs(d.outflow))
          }));
        }
      } catch (e) {
        // Silent fallback to bundled authentic snapshot
      }
    };

    fetchLivePulse();
    const interval = setInterval(fetchLivePulse, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isZerodhaLive, isKiteSimulating]);

  // Price & Indicator Alerts
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('tredye.alerts.v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'alt_1', symbol: 'NIFTY 50', condition: 'above', target: 25100, label: 'Nifty Breakout Alert', triggered: false },
      { id: 'alt_2', symbol: 'INDIA VIX', condition: 'above', target: 18.0, label: 'Volatility Spike Alert', triggered: false },
      { id: 'alt_3', symbol: 'TATASTEEL', condition: 'above', target: 156.0, label: 'Resistance Break', triggered: false }
    ];
  });

  const [toasts, setToasts] = useState([]);

  const showToast = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const addAlert = (alert) => {
    const updated = [alert, ...alerts];
    setAlerts(updated);
    localStorage.setItem('tredye.alerts.v1', JSON.stringify(updated));
    showToast('Alert Created', `Watching ${alert.symbol} ${alert.condition} ${alert.target}`, 'success');
    playAlertSound('success');
  };

  const removeAlert = (id) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem('tredye.alerts.v1', JSON.stringify(updated));
  };

  // Active chart symbol modal
  const [activeChartSymbol, setActiveChartSymbol] = useState(null);

  // Journal state with localStorage
  const [journalTrades, setJournalTrades] = useState(() => {
    try {
      const saved = localStorage.getItem('tredye.journal.v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_JOURNAL_TRADES;
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('tredye.theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update option chain when symbol or expiry changes
  useEffect(() => {
    setOptionData(generateOptionChain(selectedOptionSymbol, selectedExpiry));
  }, [selectedOptionSymbol, selectedExpiry]);

  // Audio tone generator using Web Audio API
  const playAlertSound = (type = 'success') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      const freq = type === 'success' ? 784 : type === 'warning' ? 440 : 587;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  // --- Zerodha Kite Tick Handler ---
  const handleKiteTicks = (ticks) => {
    if (!ticks || !ticks.length) return;

    ticks.forEach(tick => {
      // 1. Update Benchmark Indices
      if (tick.symbol === 'NIFTY 50') {
        setIndices(prev => {
          const prevClose = prev[0].prevClose || 24964.15;
          const chg = tick.change != null ? tick.change : +(tick.last_price - prevClose).toFixed(2);
          const pChg = tick.pChange != null ? tick.pChange : +((chg / prevClose) * 100).toFixed(2);
          return [
            {
              ...prev[0],
              ltp: tick.last_price,
              change: chg,
              pChange: pChg,
              sparkline: [...prev[0].sparkline.slice(1), tick.last_price]
            },
            prev[1],
            prev[2],
            prev[3]
          ];
        });
      } else if (tick.symbol === 'BANKNIFTY') {
        setIndices(prev => {
          const prevClose = prev[1].prevClose || 58850.40;
          const chg = tick.change != null ? tick.change : +(tick.last_price - prevClose).toFixed(2);
          const pChg = tick.pChange != null ? tick.pChange : +((chg / prevClose) * 100).toFixed(2);
          return [
            prev[0],
            {
              ...prev[1],
              ltp: tick.last_price,
              change: chg,
              pChange: pChg,
              sparkline: [...prev[1].sparkline.slice(1), tick.last_price]
            },
            prev[2],
            prev[3]
          ];
        });
      } else if (tick.symbol === 'FINNIFTY') {
        setIndices(prev => {
          const prevClose = prev[2].prevClose || 26998.55;
          const chg = tick.change != null ? tick.change : +(tick.last_price - prevClose).toFixed(2);
          const pChg = tick.pChange != null ? tick.pChange : +((chg / prevClose) * 100).toFixed(2);
          return [
            prev[0],
            prev[1],
            {
              ...prev[2],
              ltp: tick.last_price,
              change: chg,
              pChange: pChg,
              sparkline: [...prev[2].sparkline.slice(1), tick.last_price]
            },
            prev[3]
          ];
        });
      } else if (tick.symbol === 'MIDCPNIFTY') {
        setIndices(prev => {
          const prevClose = prev[3].prevClose || 13980.20;
          const chg = tick.change != null ? tick.change : +(tick.last_price - prevClose).toFixed(2);
          const pChg = tick.pChange != null ? tick.pChange : +((chg / prevClose) * 100).toFixed(2);
          return [
            prev[0],
            prev[1],
            prev[2],
            {
              ...prev[3],
              ltp: tick.last_price,
              change: chg,
              pChange: pChg,
              sparkline: [...prev[3].sparkline.slice(1), tick.last_price]
            }
          ];
        });
      } else if (tick.symbol === 'INDIA VIX') {
        setVix(prev => ({
          ...prev,
          ltp: tick.last_price,
          change: tick.change != null ? tick.change : prev.change,
          pChange: tick.pChange != null ? tick.pChange : prev.pChange
        }));
      }

      // 2. Update Options Spot & Chain when matching active symbol
      if (
        (selectedOptionSymbol === 'NIFTY' && tick.symbol === 'NIFTY 50') ||
        (selectedOptionSymbol === 'BANKNIFTY' && tick.symbol === 'BANKNIFTY') ||
        (selectedOptionSymbol === tick.symbol)
      ) {
        setOptionData(prev => {
          if (!prev) return prev;
          const newSpot = tick.last_price;
          const chg = tick.change != null ? tick.change : +(newSpot - prev.spot).toFixed(2);
          const chg_pct = tick.pChange != null ? tick.pChange : +(chg / newSpot * 100).toFixed(2);
          return {
            ...prev,
            spot: newSpot,
            chg,
            chg_pct,
            chain_ts: `Live Kite Ticker (${new Date().toLocaleTimeString('en-IN')})`
          };
        });
      }

      // 3. Check Price Alerts
      alerts.forEach(alt => {
        if (!alt.triggered && (alt.symbol === tick.symbol || (alt.symbol === 'NIFTY 50' && tick.symbol === 'NIFTY 50'))) {
          if (alt.condition === 'above' && tick.last_price >= alt.target) {
            alt.triggered = true;
            playAlertSound('warning');
            showToast(`🔔 Price Alert Triggered`, `${alt.symbol} crossed ABOVE ₹${alt.target} (LTP: ₹${tick.last_price})`, 'warning');
          } else if (alt.condition === 'below' && tick.last_price <= alt.target) {
            alt.triggered = true;
            playAlertSound('warning');
            showToast(`🔔 Price Alert Triggered`, `${alt.symbol} fell BELOW ₹${alt.target} (LTP: ₹${tick.last_price})`, 'warning');
          }
        }
      });
    });

    if (kiteServiceRef.current) {
      setZerodhaStats({ ...kiteServiceRef.current.stats });
    }
  };

  // Initialize KiteTickerService instance
  useEffect(() => {
    kiteServiceRef.current = new KiteTickerService({
      apiKey: zerodhaConfig.apiKey,
      accessToken: zerodhaConfig.accessToken,
      mode: zerodhaConfig.mode || 'full',
      connectionMode: zerodhaConfig.connectionMode || 'relay',
      relayHost: zerodhaConfig.relayHost || '',
      onStatusChange: (status, message, stats) => {
        setZerodhaStatus(status);
        setZerodhaStatusMessage(message);
        if (stats) setZerodhaStats({ ...stats });
      },
      onTicks: handleKiteTicks,
      onError: (err) => {
        console.warn('KiteTicker error:', err);
      }
    });

    if (isZerodhaLive && zerodhaConfig.apiKey && zerodhaConfig.accessToken) {
      kiteServiceRef.current.connect();
    }

    return () => {
      if (kiteServiceRef.current) {
        kiteServiceRef.current.disconnect();
      }
    };
  }, []);

  const toggleZerodhaLive = (enable) => {
    setIsZerodhaLive(enable);
    localStorage.setItem('tredye.zerodha.enabled', String(enable));

    if (enable) {
      if (kiteServiceRef.current) {
        kiteServiceRef.current.updateConfig(zerodhaConfig);
        if (zerodhaConfig.apiKey && zerodhaConfig.accessToken) {
          kiteServiceRef.current.connect();
          showToast('Connecting Kite WebSocket', 'Handshaking with wss://ws.kite.trade...', 'info');
        } else {
          setZerodhaStatus('AUTH_REQUIRED');
          setZerodhaStatusMessage('API Key and Access Token required');
          setIsZerodhaModalOpen(true);
          showToast('Credentials Required', 'Please enter your Kite API Key and Access Token', 'warning');
        }
      }
    } else {
      if (kiteServiceRef.current) {
        kiteServiceRef.current.disconnect();
      }
      setIsKiteSimulating(false);
      showToast('Kite Live Feed OFF', 'Using official closing market data', 'info');
    }
  };

  const updateZerodhaConfig = (newConfig) => {
    const merged = { ...zerodhaConfig, ...newConfig };
    setZerodhaConfig(merged);
    localStorage.setItem('tredye.zerodha.config', JSON.stringify(merged));
    if (kiteServiceRef.current) {
      kiteServiceRef.current.updateConfig(merged);
      if (isZerodhaLive && merged.apiKey && merged.accessToken) {
        kiteServiceRef.current.connect();
      }
    }
    showToast('Kite Settings Saved', 'Configuration updated successfully', 'success');
  };

  const startKiteSimulation = () => {
    setIsZerodhaLive(true);
    setIsKiteSimulating(true);
    localStorage.setItem('tredye.zerodha.enabled', 'true');
    if (kiteServiceRef.current) {
      kiteServiceRef.current.startSimulation();
    }
    showToast('Simulating Kite Ticks', 'Streaming 184-byte full depth binary packets at 500ms intervals', 'success');
  };

  const stopKiteSimulation = () => {
    setIsKiteSimulating(false);
    if (kiteServiceRef.current) {
      kiteServiceRef.current.stopSimulation();
    }
    showToast('Simulation Paused', 'Frozen at last closing snapshot', 'info');
  };

  // Fallback random-walk simulation tick when Kite Live is not active
  useEffect(() => {
    if (!isLiveSimulating || isZerodhaLive || isKiteSimulating) return;

    const interval = setInterval(() => {
      setIndices(prev =>
        prev.map(idx => {
          const delta = (Math.random() - 0.48) * (idx.ltp * 0.0003);
          const newLtp = +(idx.ltp + delta).toFixed(2);
          const newChg = +(idx.change + delta).toFixed(2);
          const newPChg = +((newChg / idx.prevClose) * 100).toFixed(2);
          const newSparkline = [...idx.sparkline.slice(1), newLtp];

          // Check active price alerts
          alerts.forEach(alt => {
            if (!alt.triggered && alt.symbol === idx.symbol) {
              if (alt.condition === 'above' && newLtp >= alt.target) {
                alt.triggered = true;
                playAlertSound('warning');
                showToast(`🔔 Price Alert Triggered`, `${alt.symbol} crossed ABOVE ₹${alt.target} (LTP: ₹${newLtp})`, 'warning');
              } else if (alt.condition === 'below' && newLtp <= alt.target) {
                alt.triggered = true;
                playAlertSound('warning');
                showToast(`🔔 Price Alert Triggered`, `${alt.symbol} fell BELOW ₹${alt.target} (LTP: ₹${newLtp})`, 'warning');
              }
            }
          });

          return {
            ...idx,
            ltp: newLtp,
            change: newChg,
            pChange: newPChg,
            sparkline: newSparkline
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveSimulating, isZerodhaLive, isKiteSimulating, alerts]);

  // Screens for Presentation mode (without crypto)
  const screensList = [
    'pulse',
    'options',
    'oi-flow',
    'liquidity',
    'strength',
    'screeners',
    'radar',
    'news',
    'journal'
  ];

  useEffect(() => {
    if (!isPresentationMode) {
      setPresentationProgress(0);
      return;
    }

    const stepMs = 200;
    const totalSteps = (presentationInterval * 1000) / stepMs;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      const pct = (stepCount / totalSteps) * 100;
      setPresentationProgress(pct);

      if (stepCount >= totalSteps) {
        stepCount = 0;
        setCurrentScreen(prev => {
          const curIndex = screensList.indexOf(prev);
          const nextIndex = (curIndex + 1) % screensList.length;
          return screensList[nextIndex];
        });
      }
    }, stepMs);

    return () => clearInterval(timer);
  }, [isPresentationMode, presentationInterval]);

  // Journal mutations
  const addTrade = (trade) => {
    const updated = [trade, ...journalTrades];
    setJournalTrades(updated);
    localStorage.setItem('tredye.journal.v1', JSON.stringify(updated));
    playAlertSound('success');
    showToast('Trade Logged', `${trade.side.toUpperCase()} ${trade.qty} ${trade.sym} saved to journal`, 'success');
  };

  const deleteTrade = (id) => {
    const updated = journalTrades.filter(t => t.id !== id);
    setJournalTrades(updated);
    localStorage.setItem('tredye.journal.v1', JSON.stringify(updated));
    showToast('Trade Deleted', 'Removed from journal record', 'info');
  };

  const importTrades = (importedList) => {
    const updated = [...importedList, ...journalTrades];
    setJournalTrades(updated);
    localStorage.setItem('tredye.journal.v1', JSON.stringify(updated));
    playAlertSound('success');
    showToast('Trades Imported', `Successfully added ${importedList.length} trades`, 'success');
  };

  return (
    <MarketDataContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        pulseView,
        setPulseView,
        changePulseView,
        theme,
        toggleTheme,
        isLiveSimulating,
        setIsLiveSimulating,
        isPresentationMode,
        setIsPresentationMode,
        presentationInterval,
        setPresentationInterval,
        presentationProgress,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        soundEnabled,
        setSoundEnabled,
        playAlertSound,
        marketStatus,
        setMarketStatus,
        marketSubtext,
        setMarketSubtext,
        // Zerodha Kite Integration
        isZerodhaModalOpen,
        setIsZerodhaModalOpen,
        isZerodhaLive,
        toggleZerodhaLive,
        zerodhaConfig,
        updateZerodhaConfig,
        zerodhaStatus,
        zerodhaStatusMessage,
        zerodhaStats,
        startKiteSimulation,
        stopKiteSimulation,
        isKiteSimulating,
        // Data
        indices,
        vix,
        mood,
        sectors,
        flowFeed: FLOW_FEED,
        orderflowFeed: ORDERFLOW_FEED,
        selectedOptionSymbol,
        setSelectedOptionSymbol,
        selectedExpiry,
        setSelectedExpiry,
        optionsSymbols: OPTIONS_SYMBOLS,
        expiries: EXPIRIES,
        optionData,
        oiFlowData,
        liquidityTrades,
        screeners,
        radarItems,
        news,
        // Journal
        journalTrades,
        addTrade,
        deleteTrade,
        importTrades,
        // Alerts & Toasts
        alerts,
        addAlert,
        removeAlert,
        toasts,
        showToast,
        // Chart Modal
        activeChartSymbol,
        setActiveChartSymbol
      }}
    >
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) throw new Error("useMarketData must be used within a MarketDataProvider");
  return context;
}
