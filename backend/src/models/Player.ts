export interface Player {
  id: string;
  table_id: string;
  name: string;
  money_count: number;
  is_active: boolean;
  last_seen: string;
}

export interface CreatePlayerInput {
  table_id: string;
  name: string;
  money_count: number;
}