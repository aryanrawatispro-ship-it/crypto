import { Router, Request, Response } from 'express';
import { getCryptoPrice, getCryptoHistoricalData, getTrendingCryptos, getCryptoFearGreedIndex } from '../services/coinGecko';
import { getStockPriceYahoo, getStockHistoricalData } from '../services/stockData';
import { cacheGet } from '../config/redis';

const router = Router();

// GET /api/market/price/:symbol
router.get('/price/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { type = 'crypto' } = req.query;

    let priceData;
    if (type === 'crypto') {
      priceData = await getCryptoPrice(symbol);
    } else if (type === 'stock') {
      priceData = await getStockPriceYahoo(symbol);
    }

    if (!priceData) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({ price: priceData });
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// GET /api/market/history/:symbol
router.get('/history/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { type = 'crypto', days = '30' } = req.query;

    let historicalData;
    if (type === 'crypto') {
      historicalData = await getCryptoHistoricalData(symbol, parseInt(days as string));
    } else if (type === 'stock') {
      historicalData = await getStockHistoricalData(symbol);
    }

    res.json({ history: historicalData });
  } catch (error) {
    console.error('Historical data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// GET /api/market/indicators/:symbol
router.get('/indicators/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    const indicators = await cacheGet(`indicators:${symbol}`);

    if (!indicators) {
      return res.status(404).json({ error: 'Indicators not available yet' });
    }

    res.json({ indicators });
  } catch (error) {
    console.error('Indicators fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch indicators' });
  }
});

// GET /api/market/trending
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const trending = await getTrendingCryptos();
    res.json({ trending });
  } catch (error) {
    console.error('Trending fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// GET /api/market/fear-greed
router.get('/fear-greed', async (req: Request, res: Response) => {
  try {
    const fearGreed = await getCryptoFearGreedIndex();
    res.json({ fearGreed });
  } catch (error) {
    console.error('Fear & Greed fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch Fear & Greed index' });
  }
});

export default router;
