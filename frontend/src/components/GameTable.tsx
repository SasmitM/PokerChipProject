import { useState, useEffect, useRef } from 'react';
import { GameState, Player, Table, gameApi, playerApi, tableApi, Activity } from '../services/api';
import { getSocket, disconnectSocket } from '../services/socket';
import PlayerList from './PlayerList';
import ActivityFeed from './ActivityFeed';
import BettingControls from './BettingControls';
import PotDisplay from './PotDisplay';

interface GameTableProps {
  gameState: GameState;
  onLeave: () => void;
  onError: (error: string) => void;
}

export default function GameTable({ gameState, onLeave, onError }: GameTableProps) {
  const [table, setTable] = useState<Table>(gameState.table);
  const [player, setPlayer] = useState<Player>(gameState.player);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const socketRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // Join the table room
    socket.emit('join-table', {
      tableId: table.id,
      playerId: player.id,
    });

    // Listen for socket events
    socket.on('bet-placed', (data) => {
      setTable((prev) => ({ ...prev, current_pot: data.newPot }));
      if (data.playerId === player.id) {
        setPlayer((prev) => ({ ...prev, money_count: data.playerChips }));
      }
      refreshPlayers();
      refreshActivities();
    });

    socket.on('chips-taken', (data) => {
      setTable((prev) => ({ ...prev, current_pot: data.newPot }));
      if (data.playerId === player.id) {
        setPlayer((prev) => ({ ...prev, money_count: data.playerChips }));
      }
      refreshPlayers();
      refreshActivities();
    });

    socket.on('pot-reset', () => {
      setTable((prev) => ({ ...prev, current_pot: 0 }));
      refreshActivities();
    });

    socket.on('chips-updated', (data) => {
      if (data.playerId === player.id) {
        setPlayer((prev) => ({ ...prev, money_count: data.newAmount }));
      }
      refreshPlayers();
      refreshActivities();
    });

    socket.on('player-joined', () => {
      refreshPlayers();
      refreshActivities();
    });

    socket.on('player-left', () => {
      refreshPlayers();
      refreshActivities();
    });

    socket.on('error', (data) => {
      onError(data.message);
    });

    return () => {
      socket.emit('leave-table');
    };
  }, [table.id, player.id]);

  // Set up heartbeat
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await playerApi.heartbeat(gameState.sessionId);
      } catch (err: any) {
        // Heartbeat failures are non-critical, just log
        console.error('Heartbeat failed:', err);
      }
    };

    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 30000); // Every 30 seconds

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [gameState.sessionId]);

  // Check if player is admin
  useEffect(() => {
    setIsAdmin(table.created_by === player.id);
  }, [table.created_by, player.id]);

  // Initial data load - fetch fresh data from Supabase in correct order
  useEffect(() => {
    const loadFreshData = async () => {
      try {
        // Load table data first
        const tableData = await tableApi.getById(table.id);
        setTable(tableData);
        
        // Then load players list
        const playerList = await playerApi.getByTable(table.id);
        setPlayers(playerList);
        
        // Find and update current player from fresh players list
        const currentPlayerData = playerList.find(p => p.id === player.id);
        if (currentPlayerData) {
          setPlayer(currentPlayerData);
        } else {
          onError('Player not found in table. You may need to rejoin.');
        }
        
        // Finally load activities
        const activityList = await gameApi.getActivities(table.id, 50);
        setActivities(activityList);
      } catch (err: any) {
        onError(err.message || 'Failed to load game data. Please refresh the page.');
      }
    };
    
    loadFreshData();
  }, [table.id, player.id]);

  const refreshPlayers = async () => {
    try {
      const playerList = await playerApi.getByTable(table.id);
      setPlayers(playerList);
      
      // Update current player state from fresh players list
      const currentPlayerData = playerList.find(p => p.id === player.id);
      if (currentPlayerData) {
        setPlayer(currentPlayerData);
      }
    } catch (err: any) {
      onError(err.message || 'Failed to refresh players list');
    }
  };

  const refreshActivities = async () => {
    try {
      const activityList = await gameApi.getActivities(table.id, 50);
      setActivities(activityList);
    } catch (err: any) {
      onError(err.message || 'Failed to refresh activity feed');
    }
  };

  const handleBet = async (amount: number) => {
    try {
      await gameApi.bet(table.id, player.id, amount);
      // Socket event will update the state
    } catch (err: any) {
      onError(err.message || 'Failed to place bet');
    }
  };

  const handleTake = async (amount: number) => {
    try {
      await gameApi.take(table.id, player.id, amount);
      // Socket event will update the state
    } catch (err: any) {
      onError(err.message || 'Failed to take from pot');
    }
  };

  const handleResetPot = async () => {
    try {
      await gameApi.resetPot(table.id, player.id);
      // Socket event will update the state
    } catch (err: any) {
      onError(err.message || 'Failed to reset pot');
    }
  };

  const handleLeave = async () => {
    try {
      await playerApi.leave(player.id);
      if (socketRef.current) {
        socketRef.current.emit('leave-table');
        disconnectSocket();
      }
      onLeave();
    } catch (err: any) {
      onError(err.message || 'Failed to leave table');
    }
  };

  const handleEditChips = async (targetPlayerId: string, amount: number) => {
    try {
      await gameApi.editPlayerChips(table.id, targetPlayerId, amount, player.id);
      // Socket event will update the state
    } catch (err: any) {
      onError(err.message || 'Failed to edit chips');
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-poker-green">{table.name}</h1>
            <p className="text-sm text-gray-600">Table ID: {table.id}</p>
            <p className="text-xs text-gray-500 mt-1">
              Session ID: {gameState.sessionId} {isAdmin && <span className="ml-2 text-poker-green font-semibold">(Admin)</span>}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">
              Your Chips: <span className="text-poker-green">{player.money_count.toLocaleString()}</span>
            </div>
            <button
              onClick={handleLeave}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave Table
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-4">
            <PotDisplay pot={table.current_pot} isAdmin={isAdmin} onReset={handleResetPot} />
            <BettingControls
              playerChips={player.money_count}
              onBet={handleBet}
              onTake={handleTake}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PlayerList
              players={players}
              currentPlayerId={player.id}
              isAdmin={isAdmin}
              tableId={table.id}
              adminPlayerId={player.id}
              onEditChips={handleEditChips}
            />
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}

