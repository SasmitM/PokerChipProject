# Poker Chip Tracker 

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

For local development, create a `.env` file in the frontend directory (optional, defaults to `/api` proxy):
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

For production deployment on Vercel, set these environment variables in your Vercel project settings:
```env
VITE_API_BASE_URL=https://your-render-backend-url/api
VITE_SOCKET_URL=https://your-render-backend-url
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
npm run dev
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

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Deploy from the frontend directory:
```bash
cd frontend
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - Go to your project settings → Environment Variables
   - Add `VITE_API_BASE_URL` with your Render backend URL (e.g., `https://your-app.onrender.com/api`)
   - Add `VITE_SOCKET_URL` with your Render backend URL (e.g., `https://your-app.onrender.com`)

4. Redeploy after adding environment variables (Vercel will auto-deploy on git push, or manually trigger a redeploy)

### Backend (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service with these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `SUPABASE_URL` - Your Supabase project URL
     - `SUPABASE_ANON_KEY` - Your Supabase anon key
     - `PORT` - Render will set this automatically (usually 10000)

3. **Important Notes**:
   - Render's free tier has a **50-second cold start delay** when the service is inactive (no requests for ~15 minutes)
   - The first request after inactivity will take ~50 seconds to respond
   - Subsequent requests will be fast until the service goes idle again
   - For production use, consider upgrading to a paid plan for always-on service

### Local Development

For local development, both servers can run simultaneously:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the app at `http://localhost:3000` (frontend will proxy API requests to `http://localhost:4000`)

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

Built to solve the real-world problem of tracking poker chips during casual games where phones die and browsers get closed accidentally.
