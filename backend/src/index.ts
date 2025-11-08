import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import chatRoutes from './routes/chat';
import portfolioRoutes from './routes/portfolio';
import alertRoutes from './routes/alerts';
import marketRoutes from './routes/market';
import { initializeWebSocket } from './services/websocket';
import { startPriceFetcher } from './services/priceFetcher';
import { initializeRedis } from './config/redis';
import { rateLimiter } from './utils/rateLimiter';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/market', marketRoutes);

// Initialize services
async function startServer() {
  try {
    // Initialize Redis
    await initializeRedis();
    console.log('✅ Redis connected');

    // Initialize WebSocket
    initializeWebSocket(io);
    console.log('✅ WebSocket initialized');

    // Start price fetcher (background job)
    startPriceFetcher(io);
    console.log('✅ Price fetcher started');

    httpServer.listen(PORT, () => {
      console.log(`🚀 TradeGPT Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };
