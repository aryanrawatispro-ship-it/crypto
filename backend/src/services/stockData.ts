import axios from 'axios';
import { cacheGet, cacheSet } from '../config/redis';

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

interface StockPrice {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  lastUpdated: string;
}

export async function getStockPrice(symbol: string): Promise<StockPrice | null> {
  try {
    const cacheKey = `stock:price:${symbol}`;
    const cached = await cacheGet<StockPrice>(cacheKey);

    if (cached) {
      return cached;
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.warn('Alpha Vantage API key not configured');
      return null;
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: apiKey,
      },
    });

    const quote = response.data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      console.warn(`No data found for stock symbol: ${symbol}`);
      return null;
    }

    const currentPrice = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    const priceData: StockPrice = {
      symbol: symbol.toUpperCase(),
      currentPrice,
      change,
      changePercent,
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
      lastUpdated: quote['07. latest trading day'],
    };

    // Cache for 60 seconds (Alpha Vantage has rate limits)
    await cacheSet(cacheKey, priceData, 60);

    return priceData;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

export async function getStockHistoricalData(
  symbol: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<any[]> {
  try {
    const cacheKey = `stock:history:${symbol}:${interval}`;
    const cached = await cacheGet<any[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return [];
    }

    let functionName = 'TIME_SERIES_DAILY';
    if (interval === 'weekly') functionName = 'TIME_SERIES_WEEKLY';
    if (interval === 'monthly') functionName = 'TIME_SERIES_MONTHLY';

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: functionName,
        symbol: symbol.toUpperCase(),
        apikey: apiKey,
      },
    });

    const timeSeriesKey = Object.keys(response.data).find(key => key.includes('Time Series'));
    if (!timeSeriesKey) {
      return [];
    }

    const timeSeries = response.data[timeSeriesKey];
    const historicalData = Object.entries(timeSeries).map(([date, data]: [string, any]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume']),
    }));

    // Cache for 5 minutes
    await cacheSet(cacheKey, historicalData, 300);

    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

export async function searchStocks(query: string): Promise<any[]> {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return [];
    }

    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: apiKey,
      },
    });

    return response.data.bestMatches || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

// Fallback to Yahoo Finance for real-time quotes (no API key needed)
export async function getStockPriceYahoo(symbol: string): Promise<StockPrice | null> {
  try {
    const cacheKey = `stock:yahoo:${symbol}`;
    const cached = await cacheGet<StockPrice>(cacheKey);

    if (cached) {
      return cached;
    }

    // Using Yahoo Finance v8 API
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol.toUpperCase()}`,
      {
        params: {
          interval: '1d',
          range: '1d',
        },
      }
    );

    const quote = response.data.chart.result[0];
    const meta = quote.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose || meta.chartPreviousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    const priceData: StockPrice = {
      symbol: symbol.toUpperCase(),
      currentPrice,
      change,
      changePercent,
      volume: meta.regularMarketVolume || 0,
      high: meta.regularMarketDayHigh || currentPrice,
      low: meta.regularMarketDayLow || currentPrice,
      open: meta.regularMarketOpen || currentPrice,
      previousClose,
      lastUpdated: new Date(meta.regularMarketTime * 1000).toISOString(),
    };

    // Cache for 30 seconds
    await cacheSet(cacheKey, priceData, 30);

    return priceData;
  } catch (error) {
    console.error(`Error fetching Yahoo stock price for ${symbol}:`, error);
    return null;
  }
}
