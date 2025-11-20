# Poker Chip Tracker 🎰

A real-time multiplayer poker chip tracking application that remembers players even when they disconnect. Perfect for casual poker games with friends where someone's phone might die or they accidentally close their browser.

## Features

- **Session Persistence**: Players can rejoin games with their chips intact after disconnecting
- **Real-time Updates**: All players see chip movements instantly via WebSockets
- **No Login Required**: Simple name-based system for quick game setup
- **Admin Controls**: Table creators can reset pot and edit chips for dispute resolution
- **Activity Feed**: Live feed of all bets, takes, and player actions

## Tech Stack

### Backend
- **Node.js + Express** with TypeScript
- **Supabase** (PostgreSQL) for database
- **Socket.io** for real-time WebSocket communication
- **RESTful API** with layered architecture

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Socket.io Client** for real-time updates
- **Context API** for state management

## Prerequisites

- Node.js v18+ (v22+ recommended)
- npm or yarn
- Supabase account (free tier works)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/PokerChipProject-1.git
cd PokerChipProject-1
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Configuration

### Backend Setup

1. Create a `.env` file in the backend directory:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
PORT=4000
```

2. Set up Supabase tables (all with RLS disabled for development):

**tables**
- id (uuid, PK)
- name (text)
- created_by (uuid, FK → players.id, nullable)
- current_pot (int8, default: 0)
- created_at (timestamptz)

**players**
- id (uuid, PK)
- table_id (uuid, FK → tables.id)
- name (text)
- money_count (int8)
- is_active (bool, default: true)
- last_seen (timestamptz)

**sessions**
- id (int8, PK, auto-increment)
- table_id (uuid, FK → tables.id)
- player_id (uuid, FK → players.id)
- last_active_at (timestamptz)
- created_at (timestamptz)

**activity_logs**
- id (int8, PK, auto-increment)
- table_id (uuid, FK → tables.id)
- player_id (uuid, FK → players.id)
- action_type (text) - 'joined', 'left', 'bet', 'take', 'reset_pot', 'chips_edited'
- amount (int8, nullable)
- created_at (timestamptz)

### Frontend Setup

For production, create `.env.production` in the frontend directory:
```env
REACT_APP_API_URL=https://your-backend-url/api
REACT_APP_SOCKET_URL=https://your-backend-url
```

## Running the Application

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend (in a new terminal):
```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

## API Endpoints

### Tables
- `POST /api/tables` - Create table & join as creator
- `GET /api/tables/:id` - Get table details

### Players
- `POST /api/tables/:tableId/players` - Join table
- `GET /api/tables/:tableId/players` - Get active players
- `POST /api/sessions/:sessionId/rejoin` - Rejoin with session
- `POST /api/players/:playerId/leave` - Leave table
- `PATCH /api/players/:playerId/chips` - Update chips

### Game Actions
- `POST /api/tables/:tableId/bet` - Place bet
- `POST /api/tables/:tableId/take` - Take from pot
- `POST /api/tables/:tableId/reset-pot` - Reset pot (creator only)
- `PATCH /api/tables/:tableId/admin/player/:playerId/chips` - Edit chips (creator only)
- `GET /api/tables/:tableId/activities` - Get activity feed

## WebSocket Events

### Client → Server
- `join-table` - Join a table room
- `leave-table` - Leave table room

### Server → Client
- `player-joined` - New player joined
- `player-left` - Player left
- `player-disconnected` - Player connection lost
- `bet-placed` - Bet was placed
- `chips-taken` - Chips taken from pot
- `pot-reset` - Pot was reset
- `chips-updated` - Admin edited chips

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend Options
- **Railway**: Best for always-on WebSocket support (~$3-5/month)
- **Render**: Free tier available but has cold starts
- **Fly.io**: Good free tier with WebSocket support

### Local Network Play
For playing with friends on the same network:
```bash
# Start both servers
# Share your local IP: http://192.168.X.X:3000
```

### Temporary Public Access
Using ngrok for remote play:
```bash
ngrok http 4000  # Expose backend
# Update frontend to use ngrok URL
```

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

Built to solve the real-world problem of tracking poker chips during casual games where phones die and browsers get closed accidentally.
