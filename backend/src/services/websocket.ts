import { Server, Socket } from 'socket.io';

let ioInstance: Server;

export function initializeWebSocket(io: Server): void {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle subscription to price updates
    socket.on('subscribe', (symbols: string[]) => {
      console.log(`Client ${socket.id} subscribed to:`, symbols);
      symbols.forEach((symbol) => {
        socket.join(`price:${symbol}`);
      });
    });

    // Handle unsubscription
    socket.on('unsubscribe', (symbols: string[]) => {
      console.log(`Client ${socket.id} unsubscribed from:`, symbols);
      symbols.forEach((symbol) => {
        socket.leave(`price:${symbol}`);
      });
    });

    // Handle portfolio subscription
    socket.on('subscribe:portfolio', (userId: string) => {
      socket.join(`portfolio:${userId}`);
    });

    // Handle alerts subscription
    socket.on('subscribe:alerts', (userId: string) => {
      socket.join(`alerts:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

export function emitPriceUpdate(symbol: string, data: any): void {
  if (ioInstance) {
    ioInstance.to(`price:${symbol}`).emit('price:update', { symbol, data });
  }
}

export function emitPortfolioUpdate(userId: string, portfolio: any): void {
  if (ioInstance) {
    ioInstance.to(`portfolio:${userId}`).emit('portfolio:update', portfolio);
  }
}

export function emitAlertTriggered(userId: string, alert: any): void {
  if (ioInstance) {
    ioInstance.to(`alerts:${userId}`).emit('alert:triggered', alert);
  }
}

export function broadcastMarketUpdate(data: any): void {
  if (ioInstance) {
    ioInstance.emit('market:update', data);
  }
}
