-- SQL migrace pro Supabase
-- Spusťte tento SQL v Supabase SQL Editor

-- Vytvoření tabulky users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vytvoření tabulky locations
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  pano_url TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  country TEXT,
  region TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vytvoření tabulky games
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  total_score INTEGER DEFAULT 0
);

-- Vytvoření tabulky game_rounds
CREATE TABLE IF NOT EXISTS game_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_index INTEGER NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id),
  guess_lat DOUBLE PRECISION,
  guess_lng DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  score INTEGER,
  guessed_at TIMESTAMPTZ,
  UNIQUE(game_id, round_index)
);

-- Vytvoření indexů pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_game_id ON game_rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_location_id ON game_rounds(location_id);

-- Funkce pro automatické aktualizování updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pro automatické aktualizování updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = supabase_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = supabase_id);

-- Policy: Anyone can read locations (public data)
CREATE POLICY "Locations are public" ON locations
  FOR SELECT USING (true);

-- Policy: Users can read their own games
CREATE POLICY "Users can read own games" ON games
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text));

-- Policy: Users can create their own games
CREATE POLICY "Users can create own games" ON games
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) OR user_id IS NULL);

-- Policy: Users can read their own game rounds
CREATE POLICY "Users can read own game rounds" ON game_rounds
  FOR SELECT USING (game_id IN (SELECT id FROM games WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) OR user_id IS NULL));

-- Policy: Users can create their own game rounds
CREATE POLICY "Users can create own game rounds" ON game_rounds
  FOR INSERT WITH CHECK (game_id IN (SELECT id FROM games WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) OR user_id IS NULL));

-- Policy: Users can update their own game rounds
CREATE POLICY "Users can update own game rounds" ON game_rounds
  FOR UPDATE USING (game_id IN (SELECT id FROM games WHERE user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text) OR user_id IS NULL));
