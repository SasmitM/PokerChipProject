import { useState } from 'react';
import { Player } from '../services/api';
import { useButtonCooldown } from '../hooks/useButtonCooldown';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  isAdmin: boolean;
  tableId: string;
  adminPlayerId: string;
  onEditChips: (playerId: string, amount: number) => void;
}

export default function PlayerList({ players, currentPlayerId, isAdmin, onEditChips }: PlayerListProps) {
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const { isCooldown: isEditCooldown, handleClick: handleEditClick } = useButtonCooldown(2000);
  const { isCooldown: isSaveCooldown, handleClick: handleSaveClick } = useButtonCooldown(2000);

  const handleEdit = (player: Player) => {
    if (isEditCooldown) return;
    handleEditClick(() => {
      setEditingPlayer(player.id);
      setEditAmount(player.money_count.toString());
    });
  };

  const handleSave = async (playerId: string) => {
    if (isSaveCooldown) return;
    const amount = Number(editAmount);
    if (amount < 0 || !Number.isInteger(amount)) {
      alert('Please enter a valid amount');
      return;
    }
    await handleSaveClick(async () => {
      await onEditChips(playerId, amount);
      setEditingPlayer(null);
      setEditAmount('');
    });
  };

  const activePlayers = players.filter(p => p.is_active);
  const inactivePlayers = players.filter(p => !p.is_active);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Players ({activePlayers.length})</h2>
      
      <div className="space-y-2">
        {activePlayers.map((player) => (
          <div
            key={player.id}
            className={`p-3 rounded-lg border-2 ${
              player.id === currentPlayerId
                ? 'border-poker-green bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-800">
                  {player.name}
                  {player.id === currentPlayerId && (
                    <span className="ml-2 text-xs text-poker-green">(You)</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {editingPlayer === player.id ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                      min="0"
                      step="1"
                      autoFocus
                    />
                  ) : (
                    <span className="font-semibold text-poker-green">
                      ${player.money_count.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {isAdmin && player.id !== currentPlayerId && (
                <div>
                  {editingPlayer === player.id ? (
                    <button
                      onClick={() => handleSave(player.id)}
                      disabled={isSaveCooldown}
                      className="text-xs px-2 py-1 bg-poker-green text-white rounded hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaveCooldown ? '...' : 'Save'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(player)}
                      disabled={isEditCooldown}
                      className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {inactivePlayers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Inactive Players</h3>
          <div className="space-y-1">
            {inactivePlayers.map((player) => (
              <div key={player.id} className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                {player.name} - ${player.money_count.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

