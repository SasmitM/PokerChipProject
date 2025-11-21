import { io, Socket } from 'socket.io-client';

// Use environment variable for socket URL, fallback to localhost for dev
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export interface SocketEvents {
  'join-table': (data: { tableId: string; playerId: string }) => void;
  'leave-table': () => void;
  'player-joined': (data: { playerId: string; playerName: string; chips: number }) => void;
  'player-left': (data: { playerId: string; playerName: string }) => void;
  'player-disconnected': (data: { playerId: string; playerName: string }) => void;
  'bet-placed': (data: {
    playerId: string;
    playerName: string;
    amount: number;
    newPot: number;
    playerChips: number;
  }) => void;
  'chips-taken': (data: {
    playerId: string;
    playerName: string;
    amount: number;
    newPot: number;
    playerChips: number;
  }) => void;
  'pot-reset': (data: { playerId: string; playerName: string }) => void;
  'chips-updated': (data: {
    playerId: string;
    playerName: string;
    newAmount: number;
    adminName: string;
  }) => void;
  'error': (data: { message: string }) => void;
}

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

