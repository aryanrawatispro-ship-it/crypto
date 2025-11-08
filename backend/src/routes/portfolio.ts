import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/portfolio/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: Fetch from database
    const portfolio = [
      {
        symbol: 'BTC',
        assetType: 'crypto',
        quantity: 0.5,
        averageEntryPrice: 40000,
        currentPrice: 43250,
        totalValue: 21625,
        unrealizedPnL: 1625,
        unrealizedPnLPercent: 8.125,
      },
      {
        symbol: 'ETH',
        assetType: 'crypto',
        quantity: 2.5,
        averageEntryPrice: 2800,
        currentPrice: 2500,
        totalValue: 6250,
        unrealizedPnL: -750,
        unrealizedPnLPercent: -10.71,
      },
    ];

    res.json({ portfolio });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// POST /api/portfolio/:userId/add
router.post('/:userId/add', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { symbol, assetType, quantity, averageEntryPrice } = req.body;

    // TODO: Add to database

    res.json({
      message: 'Position added successfully',
      position: { symbol, assetType, quantity, averageEntryPrice },
    });
  } catch (error) {
    console.error('Add position error:', error);
    res.status(500).json({ error: 'Failed to add position' });
  }
});

// DELETE /api/portfolio/:userId/:symbol
router.delete('/:userId/:symbol', async (req: Request, res: Response) => {
  try {
    const { userId, symbol } = req.params;

    // TODO: Remove from database

    res.json({ message: 'Position removed successfully' });
  } catch (error) {
    console.error('Remove position error:', error);
    res.status(500).json({ error: 'Failed to remove position' });
  }
});

export default router;
