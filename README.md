# TradeGPT - Your AI Trading Companion

An intelligent conversational trading assistant powered by GLM-4.6 AI, providing real-time market analysis, technical indicators, and portfolio tracking for both cryptocurrencies and stocks.

![TradeGPT](https://img.shields.io/badge/TradeGPT-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Conversational AI Trading Assistant
- Natural language interaction with GLM-4.6 AI model
- Context-aware analysis remembering your portfolio and preferences
- Real-time market insights with technical and fundamental analysis
- Risk-focused recommendations with stop-loss and take-profit levels

### Multi-Asset Support
- **Cryptocurrencies**: BTC, ETH, SOL, and 1000+ altcoins
- **US Stocks**: AAPL, GOOGL, TSLA, NVDA, and major indices
- **Technical Analysis**: RSI, MACD, EMA, Bollinger Bands
- **On-Chain Analytics**: Whale movements, network activity, Fear & Greed Index

### Real-Time Features
- Live price updates via WebSocket (30-second intervals)
- Interactive TradingView charts
- Price alerts and notifications
- Portfolio tracking with P&L calculations

### Beautiful UI
- Split-screen layout: Chat (60%) + Chart (40%)
- Dark mode optimized design
- Mobile responsive
- Live price ticker

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **TradingView Lightweight Charts** for charting
- **Socket.io Client** for real-time updates
- **React Markdown** for rich message formatting

### Backend
- **Node.js** + **Express**
- **TypeScript** for type safety
- **Socket.io** for WebSocket connections
- **PostgreSQL** with Prisma ORM
- **Redis** for caching
- **Axios** for API calls

### APIs & Services
- **GLM-4.6 API**: AI-powered trading analysis
- **CoinGecko API**: Crypto price data and metrics
- **Yahoo Finance API**: Stock market data
- **Alpha Vantage API**: Alternative stock data source

## Project Structure

```
crypto/
├── backend/
│   ├── src/
│   │   ├── config/           # Redis, database config
│   │   ├── routes/           # API endpoints
│   │   │   ├── chat.ts       # Chat with AI
│   │   │   ├── portfolio.ts  # Portfolio management
│   │   │   ├── alerts.ts     # Price alerts
│   │   │   └── market.ts     # Market data
│   │   ├── services/
│   │   │   ├── glmAI.ts      # GLM-4.6 integration
│   │   │   ├── coinGecko.ts  # Crypto data fetcher
│   │   │   ├── stockData.ts  # Stock data fetcher
│   │   │   ├── technicalIndicators.ts  # RSI, MACD, etc.
│   │   │   ├── websocket.ts  # WebSocket handler
│   │   │   └── priceFetcher.ts  # Background price updates
│   │   ├── utils/            # Helpers and utilities
│   │   └── index.ts          # Server entry point
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx    # AI chat interface
│   │   │   ├── TradingChart.tsx     # TradingView charts
│   │   │   ├── PriceTicker.tsx      # Live price ticker
│   │   │   └── Portfolio.tsx        # Portfolio dashboard
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── CLAUDE.md                 # Project specifications
└── README.md                 # This file
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- API Keys:
  - GLM-4.6 API key (from Z.ai or Together AI)
  - CoinGecko API key (optional, free tier available)
  - Alpha Vantage API key (optional, free tier available)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` file:**
   ```env
   # Server
   PORT=3001
   NODE_ENV=development

   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/tradegpt?schema=public"

   # Redis
   REDIS_URL="redis://localhost:6379"

   # API Keys
   GLM_API_KEY="your-glm-4.6-api-key"
   COINGECKO_API_KEY="your-coingecko-api-key"
   ALPHA_VANTAGE_API_KEY="your-alpha-vantage-api-key"

   # CORS
   CORS_ORIGIN="http://localhost:5173"
   ```

5. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. **Start backend server:**
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

### Using Docker (Optional)

A `docker-compose.yml` is provided for easy setup:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend on port 3001
- Frontend on port 5173

## Usage Examples

### Example Conversations

**Bitcoin Analysis:**
```
User: What's your analysis on Bitcoin right now?

TradeGPT: Bitcoin is currently at $43,250 (-2.3% today)

Technical Analysis:
• Trend: Short-term bearish, testing key support
• Support: $42,800 | $41,500 (200-day MA)
• Resistance: $44,200 | $45,800
• RSI: 45 (neutral)
• MACD: Bearish crossover forming

My Assessment:
BTC is in consolidation. Current zone ($42.8k-$43.5k) is critical.

Trading Recommendation:
Buy Zone: $42,000-$42,500
Stop Loss: $41,200
Targets: $44,800 (ST) | $47,500 (MT)
Risk/Reward: 1:2.5

This is analysis, not financial advice. DYOR.
```

**Portfolio Review:**
```
User: Analyze my portfolio

TradeGPT: Your portfolio (Total: $27,875):

• BTC: 0.5 @ $40k → $43,250 (+8.1% | +$1,625)
• ETH: 2.5 @ $2,800 → $2,500 (-10.7% | -$750)

Overall P&L: +$875 (+3.2%)

Recommendations:
- BTC position looking strong, consider taking partial profits at $45k
- ETH down but near strong support, hold or DCA at current levels
- Portfolio is crypto-heavy, consider adding some stocks for diversification
```

### Quick Prompts

Click these preset prompts for instant analysis:
- "What's hot in crypto today?"
- "Analyze my portfolio"
- "Find oversold stocks"
- "Show me crypto fear & greed index"

## API Endpoints

### Chat
- `POST /api/chat` - Send message to AI assistant

### Portfolio
- `GET /api/portfolio/:userId` - Get user portfolio
- `POST /api/portfolio/:userId/add` - Add position
- `DELETE /api/portfolio/:userId/:symbol` - Remove position

### Alerts
- `GET /api/alerts/:userId` - Get price alerts
- `POST /api/alerts/:userId` - Create alert
- `DELETE /api/alerts/:userId/:alertId` - Delete alert

### Market
- `GET /api/market/price/:symbol` - Get current price
- `GET /api/market/history/:symbol` - Get historical data
- `GET /api/market/indicators/:symbol` - Get technical indicators
- `GET /api/market/trending` - Get trending cryptos
- `GET /api/market/fear-greed` - Get Fear & Greed Index

### WebSocket Events

**Client → Server:**
- `subscribe` - Subscribe to price updates
- `unsubscribe` - Unsubscribe from updates
- `subscribe:portfolio` - Subscribe to portfolio updates
- `subscribe:alerts` - Subscribe to alert notifications

**Server → Client:**
- `price:update` - Price update for subscribed symbol
- `portfolio:update` - Portfolio value update
- `alert:triggered` - Price alert triggered
- `market:update` - General market update

## Features Roadmap

### Phase 1 (Current)
- [x] Basic chat interface with AI
- [x] Real-time price updates
- [x] Technical indicators (RSI, MACD, EMA)
- [x] Portfolio tracking
- [x] TradingView charts
- [x] Price alerts

### Phase 2 (Planned)
- [ ] User authentication and accounts
- [ ] Persistent chat history
- [ ] News integration and sentiment analysis
- [ ] Advanced charting with AI-marked levels
- [ ] Mobile app (React Native)
- [ ] Trade journal and performance tracking

### Phase 3 (Future)
- [ ] Social features (share analysis)
- [ ] Paper trading mode
- [ ] Auto-trading integration (via webhooks)
- [ ] Custom AI training on user style
- [ ] Premium tiers with advanced features
- [ ] Telegram/Discord bot

## Performance Optimization

- **Caching**: Redis caches prices (30s), indicators (10min), historical data (5min)
- **Rate Limiting**: 10 requests/minute per user
- **Background Jobs**: Prices update every 30s (crypto) / 60s (stocks)
- **WebSocket**: Real-time updates without polling

## Cost Optimization

- Free tier APIs: CoinGecko (10-50 calls/min), Alpha Vantage (5 calls/min)
- GLM-4.6 is cheaper than GPT-4
- Caching reduces API calls by ~90%
- Yahoo Finance as free fallback for stocks

## Security

- **Helmet.js**: Security headers
- **CORS**: Restricted origins
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Zod schemas
- **No API keys in frontend**: All sensitive keys in backend

## Deployment

### Backend (Railway/Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy from `backend` folder

### Frontend (Vercel)
1. Import GitHub repository
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Disclaimer

**IMPORTANT**: TradeGPT provides market analysis and educational content only. This is NOT financial advice.

- Past performance does not guarantee future results
- Cryptocurrency and stock trading involves substantial risk
- Only invest what you can afford to lose
- Always do your own research (DYOR)
- Consult a licensed financial advisor before making investment decisions

The developers are not responsible for any financial losses incurred while using this software.

## Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/tradegpt/issues)
- Documentation: [Full docs](https://docs.tradegpt.com)
- Discord: [Join community](https://discord.gg/tradegpt)

## Acknowledgments

- GLM-4.6 by Zhipu AI
- CoinGecko for crypto data
- TradingView for charting library
- The open-source community

---

Built with ❤️ for traders who want to make smarter decisions
