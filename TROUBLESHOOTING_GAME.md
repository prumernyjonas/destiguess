# 🔍 Řešení problému "Nepodařilo se spustit hru"

## Nejčastější příčiny:

### 1. ❌ Tabulky v Supabase nejsou vytvořené

**Řešení:**
1. Otevři Supabase Dashboard → **SQL Editor**
2. Zkopíruj obsah souboru `supabase/migrations/001_initial_schema.sql`
3. Vlož do SQL Editor a klikni **Run**

### 2. ❌ V databázi nejsou žádné lokace

**Řešení:**
1. Zkontroluj v Supabase Dashboard → **Table Editor** → `locations`
2. Pokud je tabulka prázdná, spusť:
```bash
npm run seed
```

**Nebo přidej lokace ručně:**
- Otevři Supabase Dashboard → **Table Editor** → `locations`
- Klikni **Insert row** a přidej lokace

### 3. ❌ Chybí environment variables

**Zkontroluj `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. ❌ Chyba v Supabase dotazu

**Zkontroluj konzoli serveru** (kde běží `npm run dev`):
- Měly by se zobrazit detaily chyby
- Zkopíruj error message

## 🔧 Rychlé řešení:

### Krok 1: Zkontroluj tabulky
```sql
-- Spusť v Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Měly by být vidět: `users`, `games`, `game_rounds`, `locations`

### Krok 2: Zkontroluj lokace
```sql
-- Spusť v Supabase SQL Editor
SELECT COUNT(*) FROM locations;
```

Mělo by být alespoň 5 lokací.

### Krok 3: Pokud není 5 lokací, spusť seed
```bash
npm run seed
```

### Krok 4: Zkontroluj error v konzoli
- Otevři Developer Tools (F12)
- Klikni na **Console** tab
- Zkus znovu spustit hru
- Zkopíruj error message

## 📝 Checklist:

- [ ] SQL migrace spuštěna v Supabase
- [ ] Tabulky existují (`users`, `games`, `game_rounds`, `locations`)
- [ ] V tabulce `locations` je alespoň 5 řádků
- [ ] `.env.local` obsahuje Supabase credentials
- [ ] Dev server běží (`npm run dev`)
- [ ] Zkontroloval jsi error v konzoli prohlížeče

## 🆘 Pokud problém přetrvává:

1. **Zkontroluj Network tab** v Developer Tools:
   - Klikni na request `/api/game/start`
   - Podívej se na **Response** tab
   - Zkopíruj error message

2. **Zkontroluj server konzoli**:
   - V terminálu kde běží `npm run dev`
   - Měly by být error logy

3. **Zkontroluj Supabase Dashboard**:
   - Table Editor → zkontroluj, že tabulky existují
   - SQL Editor → zkus spustit: `SELECT * FROM locations LIMIT 5;`

Pošli mi error message z konzole a pomůžu ti to vyřešit! 🚀
