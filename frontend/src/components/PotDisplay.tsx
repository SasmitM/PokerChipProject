interface PotDisplayProps {
  pot: number;
  isAdmin: boolean;
  onReset: () => void;
}

export default function PotDisplay({ pot, isAdmin, onReset }: PotDisplayProps) {
  return (
    <div className="bg-gradient-to-br from-poker-gold to-yellow-400 rounded-lg shadow-xl p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Current Pot</h2>
      <div className="text-6xl font-bold text-gray-900 mb-4">
        ${pot.toLocaleString()}
      </div>
      {isAdmin && (
        <button
          onClick={onReset}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Reset Pot
        </button>
      )}
    </div>
  );
}

