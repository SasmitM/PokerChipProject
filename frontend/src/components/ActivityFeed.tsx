import { Activity } from '../services/api';

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const formatActivity = (activity: Activity) => {
    const time = new Date(activity.created_at).toLocaleTimeString();
    switch (activity.action_type) {
      case 'bet':
        return `${time} - Bet $${activity.amount?.toLocaleString()}`;
      case 'take':
        return `${time} - Took $${activity.amount?.toLocaleString()} from pot`;
      case 'joined':
        return `${time} - Player joined`;
      case 'left':
        return `${time} - Player left`;
      case 'reset_pot':
        return `${time} - Pot reset`;
      case 'chips_edited':
        return `${time} - Chips edited to $${activity.amount?.toLocaleString()}`;
      default:
        return `${time} - ${activity.action_type}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Activity Feed</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto"> 
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No activities yet</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="text-sm p-2 bg-gray-50 rounded border-l-2 border-poker-green"
            >
              {formatActivity(activity)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

