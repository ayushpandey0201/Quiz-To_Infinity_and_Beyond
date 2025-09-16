import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { initSocket, setSocket } from '../../../../backend/socket/socketHandler';

export async function GET(req: NextRequest) {
  if (!global.io) {
    console.log('Initializing Socket.IO server...');
    
    // This is a simplified setup for Next.js API routes
    // In production, you'd want to use a custom server
    const httpServer = (req as any).socket?.server;
    
    if (httpServer) {
      const io = initSocket(httpServer);
      setSocket(io);
      global.io = io;
    }
  }

  return new Response('Socket.IO server initialized', { status: 200 });
}

declare global {
  var io: SocketIOServer | undefined;
}

