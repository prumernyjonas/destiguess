-- Opravené RLS policies pro Supabase
-- Spusť tento SQL v Supabase SQL Editor PO vytvoření základních tabulek

-- Odstraň staré policies (pokud existují)
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Locations are public" ON locations;
DROP POLICY IF EXISTS "Users can read own games" ON games;
DROP POLICY IF EXISTS "Users can create own games" ON games;
DROP POLICY IF EXISTS "Users can read own game rounds" ON game_rounds;
DROP POLICY IF EXISTS "Users can create own game rounds" ON game_rounds;
DROP POLICY IF EXISTS "Users can update own game rounds" ON game_rounds;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = supabase_id);

-- Policy: Users can insert their own data (DŮLEŽITÉ - bylo chybějící!)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = supabase_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = supabase_id);

-- Policy: Anyone can read locations (public data)
CREATE POLICY "Locations are public" ON locations
  FOR SELECT USING (true);

-- Policy: Users can read their own games OR games without user_id
CREATE POLICY "Users can read own games" ON games
  FOR SELECT USING (
    user_id IS NULL OR 
    user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
  );

-- Policy: Users can create games (with or without user_id)
CREATE POLICY "Users can create own games" ON games
  FOR INSERT WITH CHECK (
    user_id IS NULL OR 
    user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
  );

-- Policy: Users can read their own game rounds
CREATE POLICY "Users can read own game rounds" ON game_rounds
  FOR SELECT USING (
    game_id IN (
      SELECT id FROM games 
      WHERE user_id IS NULL OR 
            user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
    )
  );

-- Policy: Users can create their own game rounds
CREATE POLICY "Users can create own game rounds" ON game_rounds
  FOR INSERT WITH CHECK (
    game_id IN (
      SELECT id FROM games 
      WHERE user_id IS NULL OR 
            user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
    )
  );

-- Policy: Users can update their own game rounds
CREATE POLICY "Users can update own game rounds" ON game_rounds
  FOR UPDATE USING (
    game_id IN (
      SELECT id FROM games 
      WHERE user_id IS NULL OR 
            user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
    )
  );
