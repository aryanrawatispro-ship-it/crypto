import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/alerts/:userId
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: Fetch from database
    const alerts = [
      {
        id: '1',
        symbol: 'BTC',
        assetType: 'crypto',
        targetPrice: 45000,
        condition: 'above',
        isActive: true,
        isTriggered: false,
        createdAt: new Date(),
      },
    ];

    res.json({ alerts });
  } catch (error) {
    console.error('Alerts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts/:userId
router.post('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { symbol, assetType, targetPrice, condition } = req.body;

    if (!symbol || !targetPrice || !condition) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // TODO: Add to database

    res.json({
      message: 'Alert created successfully',
      alert: { symbol, assetType, targetPrice, condition },
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// DELETE /api/alerts/:userId/:alertId
router.delete('/:userId/:alertId', async (req: Request, res: Response) => {
  try {
    const { userId, alertId } = req.params;

    // TODO: Delete from database

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
