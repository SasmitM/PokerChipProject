// src/listen-websocket.ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', {
  transports: ['websocket'],  // Force WebSocket only
  reconnection: true
});

socket.on('connect', () => {
    console.log('✓ Connected to WebSocket server');
    
    // Join the table
    socket.emit('join-table', {
        tableId: '4280c20c-c69d-4270-ac7d-1141c50e1d9c',
        playerId: '0f3bf5b2-6a1a-41c5-bbda-98ecac788965'
    });
    console.log('✓ Joined table');
});

// Listen for ALL events
socket.on('bet-placed', (data: any) => {
    console.log('🎰 BET PLACED EVENT:', JSON.stringify(data, null, 2));
});

socket.on('player-joined', (data: any) => {
    console.log('👤 PLAYER JOINED:', data);
});

socket.on('error', (err: any) => {
    console.error('❌ ERROR:', err);
});

socket.on('connect_error', (err: Error) => {
    console.error('❌ CONNECTION ERROR:', err.message);
});

console.log('Listening for events... Place a bet in another terminal!');

// Keep the process running
setInterval(() => {}, 1000);