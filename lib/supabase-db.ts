import { createClient } from '@/lib/supabase/server';

export async function getSupabaseDb() {
  return await createClient();
}

// Helper funkce pro práci s databází
export const db = {
  // Users
  async getUserBySupabaseId(supabaseId: string) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_id', supabaseId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUser(userData: {
    supabase_id: string;
    email: string;
    username?: string | null;
    avatar_url?: string | null;
  }) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(supabaseId: string, updates: { username?: string; avatar_url?: string }) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('supabase_id', supabaseId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(userId: string) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Locations
  async getAllLocations() {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('locations')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  // Games
  async createGame(gameData: {
    user_id?: string | null;
    total_score?: number;
  }) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createGameRounds(rounds: Array<{
    game_id: string;
    round_index: number;
    location_id: string;
  }>) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('game_rounds')
      .insert(rounds)
      .select();
    
    if (error) throw error;
    return data || [];
  },

  async getGameWithRounds(gameId: string) {
    const supabase = await getSupabaseDb();
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();
    
    if (gameError) throw gameError;

    const { data: rounds, error: roundsError } = await supabase
      .from('game_rounds')
      .select(`
        *,
        locations(*)
      `)
      .eq('game_id', gameId)
      .order('round_index', { ascending: true });
    
    if (roundsError) throw roundsError;

    return { 
      ...game, 
      rounds: (rounds || []).map((r: any) => ({
        ...r,
        location: Array.isArray(r.locations) ? r.locations[0] : r.locations,
      }))
    };
  },

  async getRoundByGameAndIndex(gameId: string, roundIndex: number) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('game_rounds')
      .select(`
        *,
        locations(*)
      `)
      .eq('game_id', gameId)
      .eq('round_index', roundIndex)
      .single();
    
    if (error) throw error;
    return {
      ...data,
      location: Array.isArray(data.locations) ? data.locations[0] : data.locations,
    };
  },

  async updateGameRound(roundId: string, updates: {
    guess_lat?: number;
    guess_lng?: number;
    distance_km?: number;
    score?: number;
    guessed_at?: string;
  }) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('game_rounds')
      .update(updates)
      .eq('id', roundId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getGameRoundById(roundId: string) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('game_rounds')
      .select(`
        *,
        locations(*)
      `)
      .eq('id', roundId)
      .single();
    
    if (error) throw error;
    return {
      ...data,
      location: Array.isArray(data.locations) ? data.locations[0] : data.locations,
    };
  },

  async getGameRoundsByGameId(gameId: string) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('game_rounds')
      .select(`
        *,
        locations(*)
      `)
      .eq('game_id', gameId)
      .order('round_index', { ascending: true });
    
    if (error) throw error;
    return (data || []).map((r: any) => ({
      ...r,
      location: Array.isArray(r.locations) ? r.locations[0] : r.locations,
    }));
  },

  async updateGame(gameId: string, updates: {
    finished_at?: string;
    total_score?: number;
  }) {
    const supabase = await getSupabaseDb();
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', gameId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
