import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function initSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join game room for real-time updates
    socket.on('join-game', (gameId: string) => {
      socket.join(`game:${gameId}`);
      console.log(`Client ${socket.id} joined game:${gameId}`);
    });

    // Leave game room
    socket.on('leave-game', (gameId: string) => {
      socket.leave(`game:${gameId}`);
      console.log(`Client ${socket.id} left game:${gameId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// Global socket instance
let io: SocketIOServer | undefined;

export function getSocket(): SocketIOServer | undefined {
  return io;
}

export function setSocket(socketInstance: SocketIOServer) {
  io = socketInstance;
}

// Emit leaderboard updates
export function emitLeaderboardUpdate(gameId: string, leaderboard: any[]) {
  if (io) {
    io.to(`game:${gameId}`).emit('leaderboard-update', leaderboard);
  }
}

// Emit game state updates
export function emitGameStateUpdate(gameId: string, gameState: any) {
  if (io) {
    io.to(`game:${gameId}`).emit('game-state-update', gameState);
  }
}

