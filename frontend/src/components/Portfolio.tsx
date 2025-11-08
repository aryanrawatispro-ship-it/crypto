import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react';
import axios from 'axios';

interface PortfolioPosition {
  symbol: string;
  assetType: string;
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export default function Portfolio() {
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('/api/portfolio/demo-user');
      const portfolio = response.data.portfolio;

      setPositions(portfolio);

      const total = portfolio.reduce((sum: number, p: PortfolioPosition) => sum + p.totalValue, 0);
      const pnl = portfolio.reduce((sum: number, p: PortfolioPosition) => sum + p.unrealizedPnL, 0);

      setTotalValue(total);
      setTotalPnL(pnl);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  return (
    <div className="h-full bg-dark-card p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Portfolio</h3>
          <p className="text-xs text-gray-400">Your holdings</p>
        </div>
        <button className="p-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-dark-bg rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Total Value</span>
          </div>
          <span className="text-xl font-bold">${totalValue.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Total P&L</span>
          <div
            className={`flex items-center gap-1 font-semibold ${
              totalPnL >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {totalPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>
              ${Math.abs(totalPnL).toLocaleString()} ({((totalPnL / (totalValue - totalPnL)) * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="space-y-2">
        {positions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No positions yet</p>
            <p className="text-xs mt-1">Add your first position to get started</p>
          </div>
        ) : (
          positions.map((position) => (
            <div key={position.symbol} className="bg-dark-bg rounded-lg p-3 hover:bg-dark-bg/70 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold">{position.symbol}</div>
                  <div className="text-xs text-gray-400">
                    {position.quantity} @ ${position.averageEntryPrice.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${position.totalValue.toLocaleString()}</div>
                  <div
                    className={`text-xs font-medium ${
                      position.unrealizedPnLPercent >= 0 ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {position.unrealizedPnLPercent >= 0 ? '+' : ''}
                    {position.unrealizedPnLPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Current: ${position.currentPrice.toLocaleString()}</span>
                <span
                  className={`font-medium ${
                    position.unrealizedPnL >= 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {position.unrealizedPnL >= 0 ? '+' : ''}${position.unrealizedPnL.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
