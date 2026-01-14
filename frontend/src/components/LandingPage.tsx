import { useState } from 'react';
import { tableApi, playerApi, GameState } from '../services/api';
import { useButtonCooldown } from '../hooks/useButtonCooldown';

interface LandingPageProps {
  onGameStart: (state: GameState) => void;
  onError: (error: string) => void;
}

export default function LandingPage({ onGameStart, onError }: LandingPageProps) {
  const [mode, setMode] = useState<'create' | 'join' | 'rejoin'>('create');
  const [loading, setLoading] = useState(false);
  const { isCooldown, handleClick } = useButtonCooldown(2000);

  // Create table form
  const [tableName, setTableName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [initialChips, setInitialChips] = useState(1000);

  // Join table form
  const [tableId, setTableId] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [joinInitialChips, setJoinInitialChips] = useState(1000);

  // Rejoin form
  const [sessionId, setSessionId] = useState('');

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCooldown || loading) return;
    if (!tableName.trim() || !playerName.trim()) {
      onError('Please fill in all required fields');
      return;
    }

    await handleClick(async () => {
      setLoading(true);
      try {
        const result = await tableApi.create(tableName, playerName, initialChips);
        onGameStart({
          table: result.table,
          player: result.player,
          sessionId: result.sessionId,
        });
      } catch (err: any) {
        onError(err.message || 'Failed to create table');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleJoinTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCooldown || loading) return;
    if (!tableId.trim() || !joinPlayerName.trim()) {
      onError('Please fill in all required fields');
      return;
    }

    await handleClick(async () => {
      setLoading(true);
      try {
        const result = await playerApi.join(tableId, joinPlayerName, joinInitialChips);
        const table = await tableApi.getById(tableId);
        onGameStart({
          table,
          player: result.player,
          sessionId: result.sessionId,
        });
      } catch (err: any) {
        onError(err.message || 'Failed to join table');
      } finally {
        setLoading(false);
      }
    });
  };

  const handleRejoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCooldown || loading) return;
    if (!sessionId.trim()) {
      onError('Please enter a session ID');
      return;
    }

    await handleClick(async () => {
      setLoading(true);
      try {
        const result = await playerApi.rejoin(sessionId);
        const table = await tableApi.getById(result.tableId);
        onGameStart({
          table,
          player: result.player,
          sessionId: result.sessionId,
        });
      } catch (err: any) {
        onError(err.message || 'Session not found. Make sure you entered the correct session ID.');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-poker-green">
           Poker Chip Tracker
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Track your poker game chips and bets
        </p>

        {/* Mode selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              mode === 'create'
                ? 'bg-poker-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Create Table
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              mode === 'join'
                ? 'bg-poker-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Join Table
          </button>
          <button
            onClick={() => setMode('rejoin')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              mode === 'rejoin'
                ? 'bg-poker-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejoin
          </button>
        </div>

        {/* Create Table Form */}
        {mode === 'create' && (
          <form onSubmit={handleCreateTable} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Name
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                placeholder="e.g., Friday Night Poker"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Chips
              </label>
              <input
                type="number"
                value={initialChips}
                onChange={(e) => setInitialChips(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                min="1"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || isCooldown}
              className="w-full bg-poker-green text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : isCooldown ? 'Please wait...' : 'Create & Join Table'}
            </button>
          </form>
        )}

        {/* Join Table Form */}
        {mode === 'join' && (
          <form onSubmit={handleJoinTable} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table ID
              </label>
              <input
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                placeholder="Enter table ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Chips
              </label>
              <input
                type="number"
                value={joinInitialChips}
                onChange={(e) => setJoinInitialChips(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                min="1"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || isCooldown}
              className="w-full bg-poker-green text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : isCooldown ? 'Please wait...' : 'Join Table'}
            </button>
          </form>
        )}

        {/* Rejoin Form */}
        {mode === 'rejoin' && (
          <form onSubmit={handleRejoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session ID
              </label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent"
                placeholder="Enter your session ID"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use this to reconnect if you disconnected. Your session ID is saved when you join a table.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || isCooldown}
              className="w-full bg-poker-green text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Rejoining...' : isCooldown ? 'Please wait...' : 'Rejoin Game'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

