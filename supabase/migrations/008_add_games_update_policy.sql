-- RLS policy pro UPDATE na games – umožní dokončit hru (nastavení finished_at, total_score)
-- Bez této policy volání /api/game/finish selhává s "Nepodařilo se dokončit hru"

CREATE POLICY "Users can update own games" ON games
  FOR UPDATE USING (
    user_id IS NULL OR 
    user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
  );
