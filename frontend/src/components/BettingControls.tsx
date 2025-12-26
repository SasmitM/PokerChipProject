import { useState } from 'react';
import { useButtonCooldown } from '../hooks/useButtonCooldown';

interface BettingControlsProps {
  playerChips: number;
  onBet: (amount: number) => void;
  onTake: (amount: number) => void;
}

export default function BettingControls({ playerChips, onBet, onTake }: BettingControlsProps) {
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'bet' | 'take'>('bet');
  const { isCooldown, handleClick } = useButtonCooldown(2000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCooldown) return;
    
    const numAmount = Number(amount);
    if (numAmount <= 0 || !Number.isInteger(numAmount)) {
      return;
    }

    handleClick(async () => {
      if (action === 'bet') {
        if (numAmount > playerChips) {
          alert('Insufficient chips!');
          return;
        }
        onBet(numAmount);
      } else {
        onTake(numAmount);
      }
      setAmount('');
    });
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Place Bet / Take from Pot</h2>
      
      {/* Action selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAction('bet')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
            action === 'bet'
              ? 'bg-poker-green text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Place Bet
        </button>
        <button
          onClick={() => setAction('take')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
            action === 'take'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Take from Pot
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poker-green focus:border-transparent text-lg"
            placeholder="Enter amount"
            min="1"
            step="1"
            required
          />
        </div>

        {/* Quick amount buttons */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount.toString())}
                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isCooldown}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            action === 'bet'
              ? 'bg-poker-green hover:bg-green-800'
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isCooldown ? 'Please wait...' : (action === 'bet' ? 'Place Bet' : 'Take from Pot')}
        </button>
      </form>

      {action === 'bet' && (
        <p className="text-sm text-gray-600 mt-4 text-center">
          Available chips: <span className="font-semibold text-poker-green">${playerChips.toLocaleString()}</span>
        </p>
      )}
    </div>
  );
}

