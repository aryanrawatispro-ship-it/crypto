import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  assetType: 'crypto' | 'stock';
}

export default function TradingChart({ symbol, assetType }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#131829' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    seriesRef.current = candlestickSeries;

    // Fetch and load data
    fetchChartData();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, assetType]);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/market/history/${symbol}`, {
        params: { type: assetType, days: 30 },
      });

      const data = response.data.history;

      if (assetType === 'crypto') {
        // Convert crypto data to candlestick format (simplified)
        const candlestickData = data.slice(0, 100).map((item: any, index: number) => {
          const time = new Date(item.timestamp).getTime() / 1000;
          const open = item.price * (0.99 + Math.random() * 0.02);
          const close = item.price;
          const high = Math.max(open, close) * (1 + Math.random() * 0.01);
          const low = Math.min(open, close) * (1 - Math.random() * 0.01);

          return {
            time: time as any,
            open,
            high,
            low,
            close,
          };
        });

        seriesRef.current?.setData(candlestickData);
      } else {
        // Stock data is already in OHLC format
        const candlestickData = data.slice(0, 100).map((item: any) => ({
          time: new Date(item.date).getTime() / 1000 as any,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        seriesRef.current?.setData(candlestickData);
      }

      chartRef.current?.timeScale().fitContent();
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-dark-card p-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">{symbol} Chart</h3>
        <p className="text-xs text-gray-400">
          {assetType === 'crypto' ? 'Cryptocurrency' : 'Stock'} Price Chart
        </p>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-card/50 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      <div ref={chartContainerRef} className="w-full h-[calc(100%-60px)]" />
    </div>
  );
}
