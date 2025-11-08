import cron from 'node-cron';
import { Server } from 'socket.io';
import { getMultipleCryptoPrices, getCryptoHistoricalData } from './coinGecko';
import { getStockPriceYahoo } from './stockData';
import { calculateAllIndicators } from './technicalIndicators';
import { emitPriceUpdate, broadcastMarketUpdate } from './websocket';
import { cacheSet } from '../config/redis';

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'ADA', 'MATIC', 'AVAX', 'LINK', 'UNI', 'DOT', 'ATOM'];
const STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'META', 'AMZN', 'SPY', 'QQQ'];

export function startPriceFetcher(io: Server): void {
  console.log('Starting price fetcher...');

  // Fetch crypto prices every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    await fetchCryptoPrices();
  });

  // Fetch stock prices every 60 seconds
  cron.schedule('*/60 * * * * *', async () => {
    await fetchStockPrices();
  });

  // Fetch and calculate indicators every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await fetchAndCalculateIndicators();
  });

  // Initial fetch
  fetchCryptoPrices();
  fetchStockPrices();
  fetchAndCalculateIndicators();
}

async function fetchCryptoPrices(): Promise<void> {
  try {
    const prices = await getMultipleCryptoPrices(CRYPTO_SYMBOLS);

    for (const [symbol, priceData] of Object.entries(prices)) {
      // Cache the price data
      await cacheSet(`market:${symbol}`, priceData, 60);

      // Emit to WebSocket subscribers
      emitPriceUpdate(symbol, priceData);
    }

    // Broadcast market summary
    const summary = {
      timestamp: new Date().toISOString(),
      cryptos: prices,
    };
    broadcastMarketUpdate(summary);
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
  }
}

async function fetchStockPrices(): Promise<void> {
  try {
    const stockPrices: any = {};

    for (const symbol of STOCK_SYMBOLS) {
      const priceData = await getStockPriceYahoo(symbol);
      if (priceData) {
        stockPrices[symbol] = priceData;

        // Cache the price data
        await cacheSet(`market:${symbol}`, priceData, 60);

        // Emit to WebSocket subscribers
        emitPriceUpdate(symbol, priceData);
      }
    }

    console.log(`Fetched ${Object.keys(stockPrices).length} stock prices`);
  } catch (error) {
    console.error('Error fetching stock prices:', error);
  }
}

async function fetchAndCalculateIndicators(): Promise<void> {
  try {
    console.log('Calculating technical indicators...');

    // Calculate indicators for top cryptos
    for (const symbol of ['BTC', 'ETH', 'SOL']) {
      const historicalData = await getCryptoHistoricalData(symbol, 30);
      if (historicalData.length > 0) {
        const prices = historicalData.map((d) => d.price);
        const indicators = calculateAllIndicators(prices);

        // Cache indicators
        await cacheSet(`indicators:${symbol}`, indicators, 600);

        console.log(`Calculated indicators for ${symbol}:`, indicators);
      }
    }
  } catch (error) {
    console.error('Error calculating indicators:', error);
  }
}
