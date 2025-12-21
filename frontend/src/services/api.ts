// Use environment variable for API base URL, fallback to proxy for dev
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

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

// Helper to get headers with ngrok bypass if needed
function getHeaders(includeContentType: boolean = true): HeadersInit {
  const headers: HeadersInit = {};
  if (includeContentType) {
    (headers as any)['Content-Type'] = 'application/json';
  }
  // Add ngrok bypass header for free tier domains
  if (API_BASE.includes('ngrok-free.dev') || API_BASE.includes('ngrok-free.app')) {
    (headers as any)['ngrok-skip-browser-warning'] = 'any';
  }
  return headers;
}

// Helper to safely parse JSON response (checks content-type first)
async function parseJsonResponse<T>(res: Response, url: string): Promise<T> {
  const contentType = res.headers.get('content-type');
  
  // Check if response is actually JSON
  if (!contentType || !contentType.includes('application/json')) {
    // If it's HTML, it's likely ngrok warning page
    if (contentType && contentType.includes('text/html')) {
      throw new Error(
        `Received HTML instead of JSON from ${url}. ` +
        `This might be ngrok's warning page. Make sure you've set the ngrok bypass header.`
      );
    }
    throw new Error(
      `Expected JSON but got ${contentType || 'unknown content type'} from ${url}`
    );
  }
  
  try {
    return await res.json();
  } catch (error: any) {
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }
}

// Helper function to parse error responses
async function parseError(res: Response, url: string): Promise<string> {
  const contentType = res.headers.get('content-type');
  
  // Handle network/CORS errors
  if (res.status === 0) {
    return `Network error: Cannot connect to ${url}. Check that your backend is running and accessible.`;
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
    if (contentType && contentType.includes('text/html')) {
      return `Received HTML response from ${url}. This might be ngrok's warning page blocking the request.`;
    }
    if (res.status === 404) {
      return `Endpoint not found: ${url}. Make sure your API URL is correct and includes /api. (Current API Base: ${API_BASE})`;
    }
    if (res.status === 403) {
      return `Forbidden: CORS might be blocking the request. Check your backend CORS settings.`;
    }
    return `HTTP ${res.status}: ${res.statusText}. Server returned non-JSON response (${contentType || 'unknown'}).`;
  }
}


// Table API
export const tableApi = {
  create: async (tableName: string, playerName: string, initialChips: number = 1000): Promise<CreateTableResponse> => {
    const url = `${API_BASE}/tables`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tableName, playerName, initialChips }),
    });
    if (!res.ok) {
      const errorMsg = await parseError(res, url);
      throw new Error(errorMsg);
    }
    return parseJsonResponse<CreateTableResponse>(res, url);
  },

  getById: async (tableId: string): Promise<Table> => {
    const url = `${API_BASE}/tables/${tableId}`;
    const res = await fetch(url, {
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Table not found');
    return parseJsonResponse<Table>(res, url);
  },
};

// Player API
export const playerApi = {
  join: async (tableId: string, name: string, initialChips: number = 1000): Promise<JoinTableResponse> => {
    const url = `${API_BASE}/tables/${tableId}/players`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, initialChips }),
    });
    if (!res.ok) {
      const errorMsg = await parseError(res, url);
      throw new Error(errorMsg);
    }
    return parseJsonResponse<JoinTableResponse>(res, url);
  },

  getByTable: async (tableId: string): Promise<Player[]> => {
    const url = `${API_BASE}/tables/${tableId}/players`;
    const res = await fetch(url, {
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Failed to fetch players');
    return parseJsonResponse<Player[]>(res, url);
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
    return parseJsonResponse<RejoinResponse>(res, url);
  },

  leave: async (playerId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/players/${playerId}/leave`, {
      method: 'POST',
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
    return parseJsonResponse<Player>(res, url);
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
    const url = `${API_BASE}/tables/${tableId}/bet`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ playerId, amount }),
    });
    if (!res.ok) {
      const errorMsg = await parseError(res, url);
      throw new Error(errorMsg);
    }
    return parseJsonResponse(res, url);
  },

  take: async (tableId: string, playerId: string, amount: number) => {
    const url = `${API_BASE}/tables/${tableId}/take`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ playerId, amount }),
    });
    if (!res.ok) {
      const errorMsg = await parseError(res, url);
      throw new Error(errorMsg);
    }
    return parseJsonResponse(res, url);
  },

  resetPot: async (tableId: string, playerId: string) => {
    const url = `${API_BASE}/tables/${tableId}/reset-pot`;
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ playerId }),
    });
    if (!res.ok) {
      const errorMsg = await parseError(res, url);
      throw new Error(errorMsg);
    }
    return parseJsonResponse(res, url);
  },

  editPlayerChips: async (tableId: string, targetPlayerId: string, amount: number, adminPlayerId: string) => {
    const url = `${API_BASE}/tables/${tableId}/admin/player/${targetPlayerId}/chips`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ amount, adminPlayerId }),
    });
    if (!res.ok) {
      const errorMsg = await parseError(res, url);
      throw new Error(errorMsg);
    }
    return parseJsonResponse(res, url);
  },

  getActivities: async (tableId: string, limit: number = 50): Promise<Activity[]> => {
    const url = `${API_BASE}/tables/${tableId}/activities?limit=${limit}`;
    const res = await fetch(url, {
      headers: getHeaders(false),
    });
    if (!res.ok) throw new Error('Failed to fetch activities');
    return parseJsonResponse<Activity[]>(res, url);
  },
};

