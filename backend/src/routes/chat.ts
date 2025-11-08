import { Router, Request, Response } from 'express';
import { generateAIResponse, streamAIResponse } from '../services/glmAI';
import { getCryptoPrice } from '../services/coinGecko';
import { getStockPriceYahoo } from '../services/stockData';
import { cacheGet } from '../config/redis';
import { chatRateLimiter } from '../utils/rateLimiter';
import { detectAssets } from '../utils/assetDetector';

const router = Router();

router.use(chatRateLimiter);

// POST /api/chat
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, userId, conversationId, stream = true } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Detect mentioned assets in the message
    const detectedAssets = detectAssets(message);

    // Fetch market data for detected assets
    const marketData: any = {};
    for (const asset of detectedAssets) {
      if (asset.type === 'crypto') {
        const price = await getCryptoPrice(asset.symbol);
        if (price) marketData[asset.symbol] = price;
      } else if (asset.type === 'stock') {
        const price = await getStockPriceYahoo(asset.symbol);
        if (price) marketData[asset.symbol] = price;
      }
    }

    // Fetch technical indicators from cache
    let indicators: any = null;
    if (detectedAssets.length > 0) {
      const primaryAsset = detectedAssets[0].symbol;
      indicators = await cacheGet(`indicators:${primaryAsset}`);
    }

    // Fetch user portfolio (mock for now)
    const portfolio: any[] = [];

    // Build context
    const context = {
      marketData,
      indicators,
      portfolio,
      riskTolerance: 'moderate',
    };

    if (stream) {
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream the response
      const generator = streamAIResponse(message, context);
      for await (const chunk of generator) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // Non-streaming response
      const aiResponse = await generateAIResponse(message, context);
      res.json({
        response: aiResponse,
        context: {
          detectedAssets,
          marketData,
          indicators,
        },
      });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
