const API_BASE = '/api';

export interface Table {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
  current_pot: number;
}

export interface Player {
  id: string;
  table_id: string;
  name: string;
  money_count: number;
  is_active: boolean;
  last_seen: string;
}

export interface Activity {
  id: string;
  table_id: string;
  player_id: string;
  action_type: string;
  amount?: number;
  created_at: string;
}

export interface CreateTableResponse {
  table: Table;
  player: Player;
  sessionId: string;
  message: string;
}

export interface JoinTableResponse {
  message: string;
  player: Player;
  sessionId: string;
}

export interface RejoinResponse {
  message: string;
  player: Player;
  sessionId: string;
  tableId: string;
}

// Table API
export const tableApi = {
  create: async (tableName: string, playerName: string, initialChips: number = 1000): Promise<CreateTableResponse> => {
    const res = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, playerName, initialChips }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getById: async (tableId: string): Promise<Table> => {
    const res = await fetch(`${API_BASE}/tables/${tableId}`);
    if (!res.ok) throw new Error('Table not found');
    return res.json();
  },
};

// Player API
export const playerApi = {
  join: async (tableId: string, name: string, initialChips: number = 1000): Promise<JoinTableResponse> => {
    const res = await fetch(`${API_BASE}/tables/${tableId}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, initialChips }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getByTable: async (tableId: string): Promise<Player[]> => {
    const res = await fetch(`${API_BASE}/tables/${tableId}/players`);
    if (!res.ok) throw new Error('Failed to fetch players');
    return res.json();
  },

  rejoin: async (sessionId: string): Promise<RejoinResponse> => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/rejoin`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Session not found');
    return res.json();
  },

  leave: async (playerId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/players/${playerId}/leave`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to leave');
  },

  updateChips: async (playerId: string, amount: number): Promise<Player> => {
    const res = await fetch(`${API_BASE}/players/${playerId}/chips`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to update chips');
    return res.json();
  },

  heartbeat: async (sessionId: string): Promise<void> => {
    await fetch(`${API_BASE}/sessions/${sessionId}/heartbeat`, {
      method: 'POST',
    });
  },
};

// Game API
export const gameApi = {
  bet: async (tableId: string, playerId: string, amount: number) => {
    const res = await fetch(`${API_BASE}/tables/${tableId}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, amount }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to place bet');
    }
    return res.json();
  },

  take: async (tableId: string, playerId: string, amount: number) => {
    const res = await fetch(`${API_BASE}/tables/${tableId}/take`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, amount }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to take from pot');
    }
    return res.json();
  },

  resetPot: async (tableId: string, playerId: string) => {
    const res = await fetch(`${API_BASE}/tables/${tableId}/reset-pot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to reset pot');
    }
    return res.json();
  },

  editPlayerChips: async (tableId: string, targetPlayerId: string, amount: number, adminPlayerId: string) => {
    const res = await fetch(`${API_BASE}/tables/${tableId}/admin/player/${targetPlayerId}/chips`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, adminPlayerId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to edit chips');
    }
    return res.json();
  },

  getActivities: async (tableId: string, limit: number = 50): Promise<Activity[]> => {
    const res = await fetch(`${API_BASE}/tables/${tableId}/activities?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  },
};

