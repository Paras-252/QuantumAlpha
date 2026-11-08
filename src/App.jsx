import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { MarketDataProvider, useMarketData } from './context/MarketDataContext';
import Header from './components/layout/Header';
import PresentationBar from './components/layout/PresentationBar';
import CommandPalette from './components/layout/CommandPalette';
import SettingsModal from './components/layout/SettingsModal';
import AuthModal from './components/auth/AuthModal';
import ToastContainer from './components/common/ToastContainer';
import TechnicalChartModal from './components/chart/TechnicalChartModal';
import ZerodhaConfigModal from './components/layout/ZerodhaConfigModal';

// Views
import PulseView from './views/PulseView';
import OptionsView from './views/OptionsView';
import OIFlowView from './views/OIFlowView';
import LiquidityView from './views/LiquidityView';
import StrengthView from './views/StrengthView';
import ScreenersView from './views/ScreenersView';
import RadarView from './views/RadarView';
import CalmView from './views/CalmView';
import NewsView from './views/NewsView';
import JournalView from './views/JournalView';
import AcademyView from './views/AcademyView';

function MainContent() {
  const { currentScreen, setCurrentScreen } = useMarketData();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'pulse':
        return <PulseView />;
      case 'options':
        return <OptionsView />;
      case 'oi-flow':
        return <OIFlowView />;
      case 'liquidity':
        return <LiquidityView />;
      case 'strength':
        return <StrengthView />;
      case 'screeners':
        return <ScreenersView />;
      case 'radar':
        return <RadarView />;
      case 'calm':
        return <CalmView />;
      case 'news':
        return <NewsView />;
      case 'journal':
        return <JournalView />;
      case 'academy':
        return <AcademyView />;
      default:
        return <PulseView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Header />
      <PresentationBar />

      <main className="flex-1 w-full max-w-[1800px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {renderScreen()}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-hairline py-6 px-4 sm:px-6 text-xs text-muted-foreground mt-8 bg-surface-2/40">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-foreground">Quantum Alpha Pro</span>
            <span>·</span>
            <span>Live NSE F&amp;O Market Pulse &amp; Options Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button onClick={() => setCurrentScreen('academy')} className="hover:text-foreground transition-colors">F&amp;O Academy</button>
            <button onClick={() => setCurrentScreen('journal')} className="hover:text-foreground transition-colors">Trading Journal</button>
            <button onClick={() => setCurrentScreen('options')} className="hover:text-foreground transition-colors">Option Chain</button>
            <button onClick={() => setCurrentScreen('calm')} className="hover:text-foreground transition-colors">Calm Protocol</button>
          </div>

          <div className="text-[11px] text-subtle-foreground">
            © {new Date().getFullYear()} Quantum Alpha. For educational &amp; analytical purposes only. Not SEBI registered investment advice.
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <CommandPalette />
      <SettingsModal />
      <ZerodhaConfigModal />
      <AuthModal />
      <TechnicalChartModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MarketDataProvider>
        <MainContent />
      </MarketDataProvider>
    </AuthProvider>
  );
}
