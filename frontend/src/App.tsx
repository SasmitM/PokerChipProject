import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import GameTable from './components/GameTable';
import { GameState } from './services/api';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load game state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pokerGameState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setGameState(state);
      } catch (e) {
        console.error('Failed to load saved game state:', e);
      }
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState) {
      localStorage.setItem('pokerGameState', JSON.stringify(gameState));
    } else {
      localStorage.removeItem('pokerGameState');
    }
  }, [gameState]);

  const handleGameStart = (state: GameState) => {
    setGameState(state);
    setError(null);
  };

  const handleLeave = () => {
    setGameState(null);
    setError(null);
  };

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

