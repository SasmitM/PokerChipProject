# Poker Chip Tracker - Frontend

A React + TypeScript frontend for the Poker Chip Tracker application.

## Features

- 🎰 Create and join poker tables
- 💰 Track bets and pot values in real-time
- 👥 View all players and their chip counts
- 📊 Activity feed showing all game actions
- 🔄 Reconnect using session ID if you disconnect
- ⚡ Real-time updates via WebSocket

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the backend is running on `http://localhost:4000`

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Socket.IO Client

