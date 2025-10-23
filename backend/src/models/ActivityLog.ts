// src/models/ActivityLog.ts
export interface ActivityLog {
  id: number;
  table_id: string;
  player_id: string;
  action_type: 'joined' | 'left' | 'bet' | 'take' | 'reset_pot' | 'chips_edited';
  amount: number | null;
  created_at: string;
  players?: {
    name: string;
  };
}

export interface CreateActivityLogInput {
  table_id: string;
  player_id: string;
  action_type: ActivityLog['action_type'];
  amount?: number;
}