import axios from 'axios';
import { cacheGet, cacheSet } from '../config/redis';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

interface CryptoPrice {
  symbol: string;
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

interface CryptoHistoricalData {
  timestamp: number;
  price: number;
  volume: number;
}

const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  XRP: 'ripple',
  DOGE: 'dogecoin',
  SHIB: 'shiba-inu',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
};

export async function getCryptoPrice(symbol: string): Promise<CryptoPrice | null> {
  try {
    const cacheKey = `crypto:price:${symbol}`;
    const cached = await cacheGet<CryptoPrice>(cacheKey);

    if (cached) {
      return cached;
    }

    const coinId = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()];
    if (!coinId) {
      console.warn(`Unknown crypto symbol: ${symbol}`);
      return null;
    }

    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      },
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
      },
    });

    const data = response.data;
    const marketData = data.market_data;

    const priceData: CryptoPrice = {
      symbol: symbol.toUpperCase(),
      currentPrice: marketData.current_price.usd,
      change24h: marketData.price_change_24h,
      changePercent24h: marketData.price_change_percentage_24h,
      volume24h: marketData.total_volume.usd,
      marketCap: marketData.market_cap.usd,
      high24h: marketData.high_24h.usd,
      low24h: marketData.low_24h.usd,
      lastUpdated: data.last_updated,
    };

    // Cache for 30 seconds
    await cacheSet(cacheKey, priceData, 30);

    return priceData;
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    return null;
  }
}

export async function getMultipleCryptoPrices(symbols: string[]): Promise<Record<string, CryptoPrice>> {
  const results: Record<string, CryptoPrice> = {};

  const promises = symbols.map(async (symbol) => {
    const price = await getCryptoPrice(symbol);
    if (price) {
      results[symbol] = price;
    }
  });

  await Promise.all(promises);
  return results;
}

export async function getCryptoHistoricalData(
  symbol: string,
  days: number = 30
): Promise<CryptoHistoricalData[]> {
  try {
    const cacheKey = `crypto:history:${symbol}:${days}`;
    const cached = await cacheGet<CryptoHistoricalData[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const coinId = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()];
    if (!coinId) {
      return [];
    }

    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coinId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days,
        interval: days > 1 ? 'daily' : 'hourly',
      },
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
      },
    });

    const historicalData: CryptoHistoricalData[] = response.data.prices.map(
      ([timestamp, price]: [number, number], index: number) => ({
        timestamp,
        price,
        volume: response.data.total_volumes[index]?.[1] || 0,
      })
    );

    // Cache for 5 minutes
    await cacheSet(cacheKey, historicalData, 300);

    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

export async function getTrendingCryptos(): Promise<any[]> {
  try {
    const cacheKey = 'crypto:trending';
    const cached = await cacheGet<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await axios.get(`${COINGECKO_BASE_URL}/search/trending`, {
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
      },
    });

    const trending = response.data.coins.slice(0, 10);

    // Cache for 10 minutes
    await cacheSet(cacheKey, trending, 600);

    return trending;
  } catch (error) {
    console.error('Error fetching trending cryptos:', error);
    return [];
  }
}

export async function getCryptoFearGreedIndex(): Promise<{ value: number; classification: string } | null> {
  try {
    const cacheKey = 'crypto:fear-greed';
    const cached = await cacheGet<any>(cacheKey);

    if (cached) {
      return cached;
    }

    // Alternative Crypto Fear & Greed Index API
    const response = await axios.get('https://api.alternative.me/fng/');
    const data = response.data.data[0];

    const result = {
      value: parseInt(data.value),
      classification: data.value_classification,
    };

    // Cache for 1 hour
    await cacheSet(cacheKey, result, 3600);

    return result;
  } catch (error) {
    console.error('Error fetching fear & greed index:', error);
    return null;
  }
}
