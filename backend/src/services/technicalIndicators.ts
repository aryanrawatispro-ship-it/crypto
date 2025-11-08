import { RSI, MACD, EMA, BollingerBands } from 'technicalindicators';

export interface TechnicalIndicators {
  rsi?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  ema20?: number;
  ema50?: number;
  ema200?: number;
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
  trend?: 'uptrend' | 'downtrend' | 'consolidation';
  support?: number[];
  resistance?: number[];
}

export function calculateRSI(prices: number[], period: number = 14): number | undefined {
  if (prices.length < period) {
    return undefined;
  }

  const rsiValues = RSI.calculate({ values: prices, period });
  return rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : undefined;
}

export function calculateMACD(prices: number[]): any {
  if (prices.length < 26) {
    return undefined;
  }

  const macdValues = MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  const latest = macdValues[macdValues.length - 1];
  return latest ? {
    macd: latest.MACD,
    signal: latest.signal,
    histogram: latest.histogram,
  } : undefined;
}

export function calculateEMA(prices: number[], period: number): number | undefined {
  if (prices.length < period) {
    return undefined;
  }

  const emaValues = EMA.calculate({ values: prices, period });
  return emaValues.length > 0 ? emaValues[emaValues.length - 1] : undefined;
}

export function calculateBollingerBands(prices: number[], period: number = 20): any {
  if (prices.length < period) {
    return undefined;
  }

  const bbValues = BollingerBands.calculate({
    values: prices,
    period,
    stdDev: 2,
  });

  const latest = bbValues[bbValues.length - 1];
  return latest ? {
    upper: latest.upper,
    middle: latest.middle,
    lower: latest.lower,
  } : undefined;
}

export function calculateAllIndicators(prices: number[]): TechnicalIndicators {
  const indicators: TechnicalIndicators = {};

  // Calculate RSI
  indicators.rsi = calculateRSI(prices);

  // Calculate MACD
  indicators.macd = calculateMACD(prices);

  // Calculate EMAs
  indicators.ema20 = calculateEMA(prices, 20);
  indicators.ema50 = calculateEMA(prices, 50);
  indicators.ema200 = calculateEMA(prices, 200);

  // Calculate Bollinger Bands
  indicators.bollingerBands = calculateBollingerBands(prices);

  // Determine trend
  indicators.trend = determineTrend(prices, indicators);

  // Calculate support/resistance
  const { support, resistance } = findSupportResistance(prices);
  indicators.support = support;
  indicators.resistance = resistance;

  return indicators;
}

function determineTrend(prices: number[], indicators: TechnicalIndicators): 'uptrend' | 'downtrend' | 'consolidation' {
  const currentPrice = prices[prices.length - 1];
  const { ema20, ema50, ema200 } = indicators;

  // If we don't have enough EMAs, use price action
  if (!ema20 || !ema50) {
    const recentPrices = prices.slice(-10);
    const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const priceChange = ((currentPrice - avgRecent) / avgRecent) * 100;

    if (priceChange > 2) return 'uptrend';
    if (priceChange < -2) return 'downtrend';
    return 'consolidation';
  }

  // Strong uptrend: price > EMA20 > EMA50 > EMA200
  if (currentPrice > ema20 && ema20 > ema50 && (!ema200 || ema50 > ema200)) {
    return 'uptrend';
  }

  // Strong downtrend: price < EMA20 < EMA50 < EMA200
  if (currentPrice < ema20 && ema20 < ema50 && (!ema200 || ema50 < ema200)) {
    return 'downtrend';
  }

  // Otherwise consolidation
  return 'consolidation';
}

function findSupportResistance(prices: number[]): { support: number[]; resistance: number[] } {
  if (prices.length < 20) {
    return { support: [], resistance: [] };
  }

  const recentPrices = prices.slice(-50);
  const currentPrice = prices[prices.length - 1];

  // Find local minima (support) and maxima (resistance)
  const support: number[] = [];
  const resistance: number[] = [];

  for (let i = 2; i < recentPrices.length - 2; i++) {
    const price = recentPrices[i];
    const prev1 = recentPrices[i - 1];
    const prev2 = recentPrices[i - 2];
    const next1 = recentPrices[i + 1];
    const next2 = recentPrices[i + 2];

    // Local minimum (support)
    if (price < prev1 && price < prev2 && price < next1 && price < next2) {
      if (price < currentPrice && !support.includes(price)) {
        support.push(price);
      }
    }

    // Local maximum (resistance)
    if (price > prev1 && price > prev2 && price > next1 && price > next2) {
      if (price > currentPrice && !resistance.includes(price)) {
        resistance.push(price);
      }
    }
  }

  // Return top 3 support and resistance levels
  return {
    support: support.sort((a, b) => b - a).slice(0, 3),
    resistance: resistance.sort((a, b) => a - b).slice(0, 3),
  };
}

export function generateTradingSignal(indicators: TechnicalIndicators, currentPrice: number): {
  signal: 'buy' | 'sell' | 'hold';
  strength: number;
  reason: string;
} {
  let score = 0;
  const reasons: string[] = [];

  // RSI signals
  if (indicators.rsi) {
    if (indicators.rsi < 30) {
      score += 2;
      reasons.push('RSI oversold');
    } else if (indicators.rsi > 70) {
      score -= 2;
      reasons.push('RSI overbought');
    }
  }

  // MACD signals
  if (indicators.macd) {
    if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
      score += 1;
      reasons.push('MACD bullish');
    } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
      score -= 1;
      reasons.push('MACD bearish');
    }
  }

  // EMA trend signals
  if (indicators.ema20 && indicators.ema50) {
    if (currentPrice > indicators.ema20 && indicators.ema20 > indicators.ema50) {
      score += 1;
      reasons.push('Price above EMAs');
    } else if (currentPrice < indicators.ema20 && indicators.ema20 < indicators.ema50) {
      score -= 1;
      reasons.push('Price below EMAs');
    }
  }

  // Bollinger Bands signals
  if (indicators.bollingerBands) {
    if (currentPrice < indicators.bollingerBands.lower) {
      score += 1;
      reasons.push('Price near lower BB');
    } else if (currentPrice > indicators.bollingerBands.upper) {
      score -= 1;
      reasons.push('Price near upper BB');
    }
  }

  // Determine signal
  let signal: 'buy' | 'sell' | 'hold';
  if (score >= 2) signal = 'buy';
  else if (score <= -2) signal = 'sell';
  else signal = 'hold';

  const strength = Math.min(Math.abs(score) / 5, 1);

  return {
    signal,
    strength,
    reason: reasons.join(', ') || 'No clear signal',
  };
}
