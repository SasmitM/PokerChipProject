import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import GameTable from './components/GameTable';
import { GameState, playerApi, tableApi } from './services/api';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-rejoin on mount if sessionId exists in localStorage
  useEffect(() => {
    const loadSession = async () => {
      const sessionId = localStorage.getItem('pokerSessionId');
      if (sessionId) {
        try {
          // Rejoin using sessionId to get fresh data from Supabase
          const result = await playerApi.rejoin(sessionId);
          const table = await tableApi.getById(result.tableId);
          
          setGameState({
            table,
            player: result.player,
            sessionId: result.sessionId,
          });
        } catch (err: any) {
          // Session invalid or expired - clear it
          localStorage.removeItem('pokerSessionId');
          console.error('Failed to rejoin session:', err);
        }
      }
      setIsLoading(false);
    };

    loadSession();
  }, []);

  const handleGameStart = (state: GameState) => {
    setGameState(state);
    setError(null);
    // Save only sessionId to localStorage (Supabase is source of truth)
    localStorage.setItem('pokerSessionId', state.sessionId);
  };

  const handleLeave = () => {
    setGameState(null);
    setError(null);
    // Clear sessionId from localStorage
    localStorage.removeItem('pokerSessionId');
  };

  // Show loading state while checking for session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-poker-green via-green-900 to-green-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-green via-green-900 to-green-800">
      {error && (
        <div className="bg-red-600 text-white p-4 text-center">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {gameState ? (
        <GameTable gameState={gameState} onLeave={handleLeave} onError={setError} />
      ) : (
        <LandingPage onGameStart={handleGameStart} onError={setError} />
      )}
    </div>
  );
}

export default App;

