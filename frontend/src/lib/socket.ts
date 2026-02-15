import { io, Socket } from 'socket.io-client';
import { WS_URL, TOKEN_KEY } from '../constants';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem(TOKEN_KEY);
    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
  }
  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinBoard = (boardId: string) => {
  const s = getSocket();
  s.emit('board:join', boardId);
};

export const leaveBoard = (boardId: string) => {
  const s = getSocket();
  s.emit('board:leave', boardId);
};
