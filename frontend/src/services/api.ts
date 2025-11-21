// Use environment variable for API base URL, fallback to proxy for dev
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Log API base for debugging
console.log('API Base URL:', API_BASE);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

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

export interface GameState {
  table: Table;
  player: Player;
  sessionId: string;
}

// Helper function to parse error responses
async function parseError(res: Response, url: string): Promise<string> {
  const contentType = res.headers.get('content-type');
  
  // Handle network/CORS errors
  if (res.status === 0) {
    return `Network error: Cannot connect to ${url}. This might be a CORS issue or the server is down. Check that your backend is running and accessible.`;
  }
  
  if (contentType && contentType.includes('application/json')) {
    try {
      const error = await res.json();
      return error.error || error.message || `HTTP ${res.status}: ${res.statusText}`;
    } catch {
      return `HTTP ${res.status}: ${res.statusText}`;
    }
  } else {
    // If it's HTML or other non-JSON, provide a helpful error
    if (res.status === 404) {
      return `Endpoint not found: ${url}. Make sure your API URL is correct and includes /api. (Current API Base: ${API_BASE})`;
    }
    if (res.status === 403) {
      return `Forbidden: CORS might be blocking the request. Check your backend CORS settings.`;
    }
    return `HTTP ${res.status}: ${res.statusText}. Server returned non-JSON response.`;
  }
}

// Helper to get headers with ngrok bypass if needed
function getHeaders(includeContentType: boolean = true): HeadersInit {
  const headers: HeadersInit = {};
  if (includeContentType) {
    (headers as any)['Content-Type'] = 'application/json';
  }
  // Add ngrok bypass header for free tier (value can be 'any' or 'true')
  if (API_BASE.includes('ngrok-free.app')) {
    (headers as any)['ngrok-skip-browser-warning'] = 'any';
  }
  return headers;
}

// Table API
export const tableApi = {
  create: async (tableName: string, playerName: string, initialChips: number = 1000): Promise<CreateTableResponse> => {
    const url = `${API_BASE}/tables`;
    console.log('Creating table at:', url);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ tableName, playerName, initialChips }),
      });
      if (!res.ok) {
        const errorMsg = await parseError(res, url);
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (error: any) {
      // Handle network errors (CORS, connection refused, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          `Network error: Cannot connect to ${url}. ` +
          `This might be because:\n` +
          `1. Your backend is not running\n` +
          `2. ngrok is not running or URL changed\n` +
          `3. ngrok browser warning page is blocking requests (free tier) - try visiting ${url.replace('/api/tables', '/api/health')} in your browser first\n` +
          `4. CORS issue - check backend CORS settings`
        );
      }
      throw error;
    }
  },

  getById: async (tableId: string): Promise<Table> => {
    const url = `${API_BASE}/tables/${tableId}`;
    const res = await fetch(url, {
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Table not found');
    return res.json();
  },
};

// Player API
export const playerApi = {
  join: async (tableId: string, name: string, initialChips: number = 1000): Promise<JoinTableResponse> => {
    const url = `${API_BASE}/tables/${tableId}/players`;
    console.log('Joining table at:', url);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, initialChips }),
      });
      if (!res.ok) {
        const errorMsg = await parseError(res, url);
        throw new Error(errorMsg);
      }
      return res.json();
    } catch (error: any) {
      // Handle network errors (CORS, connection refused, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(
          `Network error: Cannot connect to ${url}. ` +
          `This might be because:\n` +
          `1. Your backend is not running\n` +
          `2. ngrok is not running or URL changed\n` +
          `3. ngrok browser warning page is blocking requests (free tier) - try visiting ${API_BASE.replace('/api', '/api/health')} in your browser first\n` +
          `4. CORS issue - check backend CORS settings`
        );
      }
      throw error;
    }
  },

  getByTable: async (tableId: string): Promise<Player[]> => {
    const url = `${API_BASE}/tables/${tableId}/players`;
    const res = await fetch(url, {
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Failed to fetch players');
    return res.json();
  },

  rejoin: async (sessionId: string): Promise<RejoinResponse> => {
    const url = `${API_BASE}/sessions/${sessionId}/rejoin`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(false),
    });
    if (!res.ok) {
      const errorMsg = await parseError(res, url);
      throw new Error(errorMsg);
    }
    return res.json();
  },

  leave: async (playerId: string): Promise<void> => {
    const url = `${API_BASE}/players/${playerId}/leave`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Failed to leave');
  },

  updateChips: async (playerId: string, amount: number): Promise<Player> => {
    const url = `${API_BASE}/players/${playerId}/chips`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to update chips');
    return res.json();
  },

  heartbeat: async (sessionId: string): Promise<void> => {
    const url = `${API_BASE}/sessions/${sessionId}/heartbeat`;
    await fetch(url, {
      method: 'POST',
      headers: getHeaders(false),
    });
  },
};

// Game API
export const gameApi = {
  bet: async (tableId: string, playerId: string, amount: number) => {
    const url = `${API_BASE}/tables/${tableId}/bet`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ playerId, amount }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to place bet');
    }
    return res.json();
  },

  take: async (tableId: string, playerId: string, amount: number) => {
    const url = `${API_BASE}/tables/${tableId}/take`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ playerId, amount }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to take from pot');
    }
    return res.json();
  },

  resetPot: async (tableId: string, playerId: string) => {
    const url = `${API_BASE}/tables/${tableId}/reset-pot`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ playerId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to reset pot');
    }
    return res.json();
  },

  editPlayerChips: async (tableId: string, targetPlayerId: string, amount: number, adminPlayerId: string) => {
    const url = `${API_BASE}/tables/${tableId}/admin/player/${targetPlayerId}/chips`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ amount, adminPlayerId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to edit chips');
    }
    return res.json();
  },

  getActivities: async (tableId: string, limit: number = 50): Promise<Activity[]> => {
    const url = `${API_BASE}/tables/${tableId}/activities?limit=${limit}`;
    const res = await fetch(url, {
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  },
};

