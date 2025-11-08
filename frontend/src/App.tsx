import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import TradingChart from './components/TradingChart';
import PriceTicker from './components/PriceTicker';
import Portfolio from './components/Portfolio';
import { TrendingUp } from 'lucide-react';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC');
  const [assetType, setAssetType] = useState<'crypto' | 'stock'>('crypto');

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TradeGPT</h1>
              <p className="text-xs text-gray-400">Your AI Trading Companion</p>
            </div>
          </div>
        </div>

        {/* Price Ticker */}
        <PriceTicker onSymbolClick={(symbol, type) => {
          setSelectedSymbol(symbol);
          setAssetType(type);
        }} />
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Chat Section - 60% */}
        <div className="w-[60%] border-r border-dark-border">
          <ChatInterface
            selectedSymbol={selectedSymbol}
            assetType={assetType}
          />
        </div>

        {/* Right Section - 40% */}
        <div className="w-[40%] flex flex-col">
          {/* Chart - 60% */}
          <div className="h-[60%] border-b border-dark-border">
            <TradingChart
              symbol={selectedSymbol}
              assetType={assetType}
            />
          </div>

          {/* Portfolio - 40% */}
          <div className="h-[40%] overflow-y-auto">
            <Portfolio />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
