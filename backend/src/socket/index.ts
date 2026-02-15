import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export function setupSocket(io: Server) {
  // Authentication middleware for socket connections
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.id})`);

    // Join user's personal room for direct notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join a board room
    socket.on('board:join', (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(`User ${socket.userId} joined board:${boardId}`);
    });

    // Leave a board room
    socket.on('board:leave', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      console.log(`User ${socket.userId} left board:${boardId}`);
    });

    // Handle typing indicators
    socket.on('task:typing', (data: { boardId: string; taskId: string; userName: string }) => {
      socket.to(`board:${data.boardId}`).emit('task:typing', {
        taskId: data.taskId,
        userName: data.userName,
        userId: socket.userId,
      });
    });

    // Handle cursor/presence
    socket.on('board:presence', (data: { boardId: string; status: string }) => {
      socket.to(`board:${data.boardId}`).emit('board:presence', {
        userId: socket.userId,
        status: data.status,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId} (${socket.id})`);
    });
  });
}
