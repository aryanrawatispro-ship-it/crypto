import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'crypto' | 'stock';
}

interface PriceTickerProps {
  onSymbolClick: (symbol: string, type: 'crypto' | 'stock') => void;
}

export default function PriceTicker({ onSymbolClick }: PriceTickerProps) {
  const [tickers, setTickers] = useState<TickerItem[]>([
    { symbol: 'BTC', price: 43250, change: -1000, changePercent: -2.3, type: 'crypto' },
    { symbol: 'ETH', price: 2500, change: -150, changePercent: -5.7, type: 'crypto' },
    { symbol: 'SOL', price: 98.5, change: 2.3, changePercent: 2.4, type: 'crypto' },
    { symbol: 'AAPL', price: 185.2, change: 1.5, changePercent: 0.82, type: 'stock' },
    { symbol: 'TSLA', price: 242.8, change: -5.2, changePercent: -2.1, type: 'stock' },
  ]);

  useEffect(() => {
    const socket: Socket = io('http://localhost:3001');

    // Subscribe to price updates
    const symbols = tickers.map((t) => t.symbol);
    socket.emit('subscribe', symbols);

    socket.on('price:update', (data: any) => {
      setTickers((prev) =>
        prev.map((ticker) =>
          ticker.symbol === data.symbol
            ? {
                ...ticker,
                price: data.data.currentPrice,
                change: data.data.change24h || data.data.change,
                changePercent: data.data.changePercent24h || data.data.changePercent,
              }
            : ticker
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="overflow-x-auto bg-dark-bg border-t border-dark-border">
      <div className="flex gap-4 px-6 py-3">
        {tickers.map((ticker) => (
          <button
            key={ticker.symbol}
            onClick={() => onSymbolClick(ticker.symbol, ticker.type)}
            className="flex items-center gap-3 px-4 py-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{ticker.symbol}</span>
                <span className="text-xs text-gray-500">{ticker.type}</span>
              </div>
              <div className="text-xs text-gray-400">
                ${ticker.price.toLocaleString()}
              </div>
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                ticker.changePercent >= 0 ? 'text-success' : 'text-danger'
              }`}
            >
              {ticker.changePercent >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {ticker.changePercent >= 0 ? '+' : ''}
                {ticker.changePercent.toFixed(2)}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
