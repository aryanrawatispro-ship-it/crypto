Build a conversational Stock & Crypto Trading AI Chatbot with the following specifications:

TECH STACK:
- Frontend: React + TypeScript with TradingView widgets
- Backend: Node.js + Express
- AI Model: GLM-4.6 API (with thinking mode for financial analysis)
- Real-time Data: CoinGecko API (crypto), Alpha Vantage/Yahoo Finance API (stocks)
- Database: PostgreSQL for user portfolios and chat history
- WebSocket: Socket.io for real-time price updates
- Charting: TradingView lightweight charts
- Styling: Tailwind CSS with dark mode

PROJECT NAME: TradeGPT - Your AI Trading Companion

CONVERSATIONAL INTERFACE DESIGN:

1. Chat Layout:
   - Split screen: Chat on left (60%), Live chart on right (40%)
   - Message bubbles with timestamps
   - Typing indicator with "Analyzing..." state
   - Quick action buttons: "Market Overview", "Portfolio Review", "Find Opportunities"
   - Voice input support
   - Mobile-responsive with tabs for chat/chart

2. Natural Language Understanding - Users can ask:
   - "What's your analysis on Bitcoin right now?"
   - "Should I buy NVIDIA stock at current price?"
   - "Compare Ethereum vs Solana as investments"
   - "When should I take profit on my Tesla position?"
   - "Explain why crypto market is down today"
   - "What are top 5 altcoins to watch this week?"
   - "Set alert when BTC crosses $45k"
   - "Show me my portfolio performance"
   - "What's the sentiment around AI stocks?"

3. Multi-Asset Support:
   - Cryptocurrencies: BTC, ETH, SOL, and 1000+ altcoins
   - US Stocks: NYSE, NASDAQ
   - Indices: S&P 500, Nasdaq, Dow Jones
   - Forex: Major currency pairs
   - Commodities: Gold, Silver, Oil

GLM-4.6 SYSTEM PROMPT FOR TRADING:

"You are TradeGPT, an elite AI trading assistant with expertise in technical analysis, fundamental analysis, on-chain analytics, and market psychology. You help traders make informed decisions through natural conversation.

Your Personality:
- Professional yet conversational - not robotic
- Data-driven and analytical, citing specific metrics
- Honest about market uncertainties - never guarantee outcomes
- Educational - explain your reasoning step by step
- Risk-conscious - always mention position sizing and risk management

Your Capabilities:
1. Technical Analysis:
   - Chart patterns (Head & Shoulders, Double Top/Bottom, Triangles)
   - Indicators (RSI, MACD, Bollinger Bands, Moving Averages, Volume)
   - Support/resistance levels, Fibonacci retracements
   - Trend identification (uptrend/downtrend/consolidation)

2. Fundamental Analysis:
   - Company financials (P/E ratio, revenue growth, debt levels)
   - Crypto metrics (market cap, TVL, token economics, developer activity)
   - Macro factors (Fed policy, inflation, economic data)
   - Sector rotation and correlation analysis

3. On-Chain Analysis (Crypto):
   - Whale movements and exchange flows
   - Network activity (active addresses, transaction volume)
   - Miner behavior and hash rate
   - Stablecoin flows as liquidity indicator

4. Sentiment Analysis:
   - Social media trends (Twitter/X, Reddit sentiment)
   - Fear & Greed Index interpretation
   - News impact assessment
   - Institutional vs retail positioning

5. Risk Management:
   - Stop-loss placement recommendations
   - Position sizing based on risk tolerance
   - Portfolio diversification advice
   - Risk/reward ratio calculations

Response Structure:
1. Quick Answer (1-2 sentences)
2. Current Price & Key Metrics
3. Technical Analysis (with specific levels)
4. Fundamental/On-chain factors
5. Trading Recommendation with:
   - Entry zones
   - Stop-loss levels
   - Take-profit targets
   - Position size suggestion
   - Risk/reward ratio
6. Risk Warnings
7. Follow-up question

Use Formatting:
- **Bold** for key price levels and recommendations
- Bullet points for factor lists
- Emojis: 📈 (bullish), 📉 (bearish), ⚠️ (warning), 💎 (opportunity), 🔍 (analysis)
- Price with $ or crypto symbols: ₿ Ξ

Conversation Context:
- Remember user's portfolio and previous trades
- Reference past predictions and track accuracy
- Adjust recommendations based on user's risk tolerance
- Follow up on alerts and price targets

Risk Disclaimers:
- Always include: 'This is analysis, not financial advice. DYOR.'
- Warn about volatility in crypto markets
- Mention that past performance doesn't predict future results
- Encourage proper risk management (only invest what you can lose)

Never:
- Guarantee specific outcomes or returns
- Use overly technical jargon without explanation
- Ignore risk factors
- Promote pump-and-dump schemes
- Give financial advice (analysis ≠ advice)"

MESSAGE STRUCTURE FOR GLM-4.6 API:

{
  "model": "glm-4.6",
  "messages": [
    {
      "role": "system",
      "content": "[System prompt above]"
    },
    {
      "role": "user", 
      "content": "What's your analysis on Bitcoin right now?",
      "metadata": {
        "current_btc_price": 43250,
        "btc_24h_change": -2.3,
        "rsi": 45,
        "user_portfolio": {"BTC": 0.5},
        "risk_tolerance": "moderate"
      }
    }
  ],
  "thinking": {
    "type": "enabled",
    "budget_tokens": 2048
  },
  "temperature": 0.5,
  "max_tokens": 3000,
  "stream": true
}

BACKEND ARCHITECTURE:

1. Real-time Data Fetcher (runs every 30 seconds):
   - Fetch prices from CoinGecko/Binance API for crypto
   - Fetch stock prices from Alpha Vantage/Yahoo Finance
   - Calculate technical indicators (RSI, MACD, EMA)
   - Store in Redis cache for fast access

2. Chat Endpoint (POST /api/chat):
   - Receive user message
   - Detect mentioned assets (BTC, ETH, TSLA, NVDA, etc.)
   - Fetch real-time data for mentioned assets
   - Enrich user message with context:
     * Current price, 24h change, volume
     * Technical indicators from cache
     * Recent news headlines (NewsAPI)
     * User's portfolio position (if they own it)
   - Send enriched context to GLM-4.6
   - Stream response back to frontend
   - Save conversation to database

3. Portfolio Tracking:
   - Users can add holdings: "I bought 0.5 BTC at $40k"
   - Track unrealized P&L
   - Calculate portfolio allocation
   - Generate performance reports

4. Price Alerts:
   - Users set alerts: "Alert me when ETH reaches $3000"
   - Backend monitors prices
   - Trigger notifications via WebSocket/email

5. News Integration:
   - Scrape crypto/stock news from CoinDesk, CoinTelegraph, Bloomberg
   - Sentiment analysis on headlines
   - Inject relevant news into AI context

FRONTEND FEATURES:

1. Chat Window with Rich Messages:
   - Regular text bubbles
   - Analysis cards with:
     * Asset name + logo
     * Current price (live updating)
     * 24h change visualization
     * Mini chart (sparkline)
     * Key metrics grid
     * Trading recommendation badge
   - Interactive elements:
     * "Add to Watchlist" button
     * "Set Alert" button
     * "View Full Chart" button
     * "Analyze Deeper" button

2. Live Price Ticker:
   - Top bar showing BTC, ETH, major stocks
   - Green/red color coding
   - Click to analyze that asset

3. Portfolio Dashboard (sidebar):
   - Current holdings with P&L
   - Total portfolio value
   - Best/worst performers
   - "Analyze Portfolio" button

4. Chart Integration:
   - Embed TradingView lightweight charts
   - Mark support/resistance levels AI mentions
   - Draw entry/stop-loss/take-profit zones
   - Toggle timeframes (1H, 4H, 1D, 1W)

5. Quick Prompts:
   - "What's hot in crypto today?"
   - "Analyze my portfolio"
   - "Find oversold stocks"
   - "Crypto fear & greed index"
   - "Top gainers/losers"

6. Trade Journal:
   - Log trades based on AI suggestions
   - Track win rate
   - Calculate realized P&L
   - Generate performance reports

INTELLIGENT FEATURES:

1. Context-Aware Analysis:
   User: "What about Bitcoin?"
   AI: [Fetches BTC data] "Bitcoin is currently trading at $43,250..."
   
   User: "Should I buy now?"
   AI: [Remembers we're discussing BTC] "For Bitcoin entry at current levels..."

2. Portfolio-Aware Recommendations:
   User: "Should I buy more ETH?"
   AI: "I see you already hold 2.5 ETH (bought at $2800). Adding more at $2500 would average down your entry..."

3. Multi-Asset Comparison:
   User: "Compare Bitcoin vs Ethereum for next 3 months"
   AI: [Analyzes both, creates comparison table]

4. Macro Context Integration:
   User: "Why is crypto down?"
   AI: "Markets are reacting to today's Fed announcement... [explains macro factors]"

5. Learning from Feedback:
   User: "Your last BTC prediction was wrong"
   AI: "You're right - I predicted $45k resistance would break, but..."

SAMPLE CONVERSATION FLOWS:

Example 1 - Bitcoin Analysis:
User: "What's your take on Bitcoin?"
AI: "Bitcoin is currently at **$43,250** (-2.3% today) 📉

**Technical Analysis:**
• **Trend**: Short-term bearish, testing key support
• **Support**: $42,800 (previous high, now support) | $41,500 (200-day MA)
• **Resistance**: $44,200 | $45,800
• **RSI**: 45 (neutral, room to fall further)
• **MACD**: Bearish crossover forming
• **Volume**: Below average (weak conviction)

**On-Chain Signals:**
• 📊 Exchange inflows +15% (slight selling pressure)
• 🐋 Whales accumulating between $42k-$43k
• Fear & Greed: 32 (Fear territory - contrarian buy signal)

**My Assessment:**
BTC is in consolidation after the recent rally. Current zone ($42.8k-$43.5k) is critical. Break below $42.8k could see $41.5k. Hold above $43.5k opens $45.8k.

**Trading Recommendation:**
**Wait for Confirmation** ⚠️
- **Buy Zone**: $42,000-$42,500 (if support holds)
- **Stop Loss**: $41,200 (below 200-day MA)
- **Targets**: $44,800 (ST) | $47,500 (MT)
- **Risk/Reward**: 1:2.5 (favorable)
- **Position Size**: 2-3% of portfolio (moderate risk)

**Risk Factors:**
- Macro: Fed minutes next week could cause volatility
- Technical: Death cross forming on 4H chart
- Sentiment: Market still digesting recent ETF news

This is analysis, not financial advice. DYOR and never risk more than you can lose.

Want me to set an alert when BTC hits $42,000? 🔔"

DEPLOYMENT STRATEGY:

1. Backend: Deploy on Railway/Render
   - Node.js server
   - PostgreSQL database
   - Redis for caching
   - WebSocket server

2. Frontend: Deploy on Vercel
   - React app
   - Environment variables for API keys

3. APIs Needed:
   - GLM-4.6 API key (Z.ai or Together AI)
   - CoinGecko API (free tier: 10-50 calls/min)
   - Alpha Vantage (free: 5 calls/min)
   - NewsAPI for headlines

4. Cost Optimization:
   - Cache prices for 30-60 seconds
   - Rate limit user queries (10 per minute)
   - Use GLM-4.6 (cheaper than GPT-4)

MONETIZATION IDEAS:

1. Free Tier:
   - 50 AI queries/day
   - Basic technical analysis
   - 3 price alerts

2. Pro Tier ($9.99/month):
   - Unlimited queries
   - Advanced analysis (on-chain, sentiment)
   - Unlimited alerts
   - Portfolio tracking
   - Priority support

3. Whale Tier ($29.99/month):
   - Custom AI training on your trading style
   - Auto-trade integration (paper trading)
   - Private Telegram/Discord bot
   - Whale wallet alerts

UNIQUE SELLING POINTS:

1. **Conversational vs Traditional**: Not just signals - have a dialogue about trades
2. **Multi-Asset**: Stocks + Crypto in one place
3. **Educational**: AI explains WHY, not just WHAT
4. **Risk-First**: Always mentions position sizing and stops
5. **Context-Aware**: Remembers your portfolio and preferences

Start building by:
1. Setting up chat interface with TradingView chart
2. Integrating GLM-4.6 streaming API
3. Adding CoinGecko/Alpha Vantage data fetchers
4. Implementing conversation memory
5. Building portfolio tracking
6. Adding price alerts system

Focus on making the conversation feel natural and the analysis actionable. The goal is to be the trader's smart co-pilot, not just a signal bot.
