# Oprava: Nepodařilo se dokončit hru (500 Error)

## Problém
Při dokončení hry se zobrazuje chyba "Nepodařilo se dokončit hru" s HTTP status 500.

## Příčina
Chybí RLS (Row Level Security) policy pro UPDATE operace na tabulce `games` v Supabase.

## Řešení

### Krok 1: Otevři Supabase Dashboard
1. Jdi na https://supabase.com/dashboard
2. Vyber svůj projekt
3. Otevři **SQL Editor**

### Krok 2: Spusť migraci
Zkopíruj a spusť následující SQL:

```sql
-- RLS policy pro UPDATE na games – umožní dokončit hru
-- Bez této policy volání /api/game/finish selhává s "Nepodařilo se dokončit hru"

-- Zkontroluj, zda policy už neexistuje
DROP POLICY IF EXISTS "Users can update own games" ON games;

-- Vytvoř novou policy
CREATE POLICY "Users can update own games" ON games
  FOR UPDATE USING (
    user_id IS NULL OR 
    user_id IN (SELECT id FROM users WHERE supabase_id = auth.uid()::text)
  );
```

### Krok 3: Ověření
1. Zkus znovu dokončit hru
2. Pokud stále nefunguje, zkontroluj serverové logy v terminálu (kde běží `npm run dev`)
3. V logu by měla být detailní chybová zpráva

## Alternativní řešení (pokud výše nefunguje)

Pokud máš problém s RLS policies, můžeš dočasně vypnout RLS pro testování:

```sql
-- POZOR: Toto vypne RLS pro tabulku games - použij jen pro testování!
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
```

**DŮLEŽITÉ:** Po testování RLS znovu zapni:
```sql
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
```

## Kontrola existujících policies

Zkontroluj, jaké policies máš na tabulce `games`:

```sql
SELECT * FROM pg_policies WHERE tablename = 'games';
```

Měla by existovat policy pro:
- SELECT (čtení)
- INSERT (vytváření)
- UPDATE (aktualizace) ← **Tato často chybí!**
