import axios from 'axios';

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GLMRequestOptions {
  model?: string;
  messages: GLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  thinking?: {
    type: 'enabled';
    budget_tokens: number;
  };
}

const TRADING_SYSTEM_PROMPT = `You are TradeGPT, an elite AI trading assistant with expertise in technical analysis, fundamental analysis, on-chain analytics, and market psychology. You help traders make informed decisions through natural conversation.

Your Personality:
- Professional yet conversational - not robotic
- Data-driven and analytical, citing specific metrics
- Honest about market uncertainties - never guarantee outcomes
- Educational - explain your reasoning step by step
- Risk-conscious - always mention position sizing and risk management

Your Capabilities:
1. Technical Analysis: Chart patterns, indicators (RSI, MACD, Bollinger Bands, Moving Averages), support/resistance levels, trend identification
2. Fundamental Analysis: Company financials, crypto metrics, macro factors, sector rotation
3. On-Chain Analysis (Crypto): Whale movements, network activity, miner behavior, stablecoin flows
4. Sentiment Analysis: Social media trends, Fear & Greed Index, news impact, institutional positioning
5. Risk Management: Stop-loss placement, position sizing, portfolio diversification, risk/reward ratios

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

Always include: "This is analysis, not financial advice. DYOR."

Never:
- Guarantee specific outcomes or returns
- Use overly technical jargon without explanation
- Ignore risk factors
- Promote pump-and-dump schemes
- Give financial advice (analysis ≠ advice)`;

export async function generateAIResponse(
  userMessage: string,
  context: any,
  conversationHistory: GLMMessage[] = []
): Promise<string> {
  try {
    const apiKey = process.env.GLM_API_KEY;
    if (!apiKey) {
      throw new Error('GLM API key not configured');
    }

    // Build enriched user message with context
    const enrichedMessage = buildEnrichedMessage(userMessage, context);

    const messages: GLMMessage[] = [
      { role: 'system', content: TRADING_SYSTEM_PROMPT },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: enrichedMessage },
    ];

    const response = await axios.post(
      GLM_API_URL,
      {
        model: 'glm-4',
        messages,
        temperature: 0.7,
        max_tokens: 3000,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error generating AI response:', error.response?.data || error.message);
    return 'I apologize, but I encountered an error processing your request. Please try again.';
  }
}

export async function* streamAIResponse(
  userMessage: string,
  context: any,
  conversationHistory: GLMMessage[] = []
): AsyncGenerator<string, void, unknown> {
  try {
    const apiKey = process.env.GLM_API_KEY;
    if (!apiKey) {
      throw new Error('GLM API key not configured');
    }

    const enrichedMessage = buildEnrichedMessage(userMessage, context);

    const messages: GLMMessage[] = [
      { role: 'system', content: TRADING_SYSTEM_PROMPT },
      ...conversationHistory.slice(-6),
      { role: 'user', content: enrichedMessage },
    ];

    const response = await axios.post(
      GLM_API_URL,
      {
        model: 'glm-4',
        messages,
        temperature: 0.7,
        max_tokens: 3000,
        stream: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        responseType: 'stream',
      }
    );

    for await (const chunk of response.data) {
      const lines = chunk.toString().split('\n').filter((line: string) => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Error streaming AI response:', error.response?.data || error.message);
    yield 'I apologize, but I encountered an error processing your request.';
  }
}

function buildEnrichedMessage(userMessage: string, context: any): string {
  let enriched = userMessage;

  // Add market data context if available
  if (context.marketData) {
    enriched += `\n\n[Market Context]`;
    for (const [symbol, data] of Object.entries(context.marketData)) {
      enriched += `\n${symbol}: $${(data as any).currentPrice} (${(data as any).changePercent24h > 0 ? '+' : ''}${(data as any).changePercent24h?.toFixed(2)}%)`;
    }
  }

  // Add technical indicators if available
  if (context.indicators) {
    enriched += `\n\n[Technical Indicators]`;
    if (context.indicators.rsi) enriched += `\nRSI: ${context.indicators.rsi.toFixed(2)}`;
    if (context.indicators.macd) enriched += `\nMACD: ${context.indicators.macd.macd.toFixed(2)}`;
    if (context.indicators.trend) enriched += `\nTrend: ${context.indicators.trend}`;
    if (context.indicators.support?.length) {
      enriched += `\nSupport: ${context.indicators.support.map((s: number) => `$${s.toFixed(2)}`).join(', ')}`;
    }
    if (context.indicators.resistance?.length) {
      enriched += `\nResistance: ${context.indicators.resistance.map((r: number) => `$${r.toFixed(2)}`).join(', ')}`;
    }
  }

  // Add portfolio context if available
  if (context.portfolio && context.portfolio.length > 0) {
    enriched += `\n\n[User Portfolio]`;
    for (const position of context.portfolio) {
      enriched += `\n${position.symbol}: ${position.quantity} @ $${position.averageEntryPrice} (P&L: ${position.unrealizedPnLPercent > 0 ? '+' : ''}${position.unrealizedPnLPercent?.toFixed(2)}%)`;
    }
  }

  // Add risk tolerance if available
  if (context.riskTolerance) {
    enriched += `\n\n[Risk Tolerance: ${context.riskTolerance}]`;
  }

  return enriched;
}
