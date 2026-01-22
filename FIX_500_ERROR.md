# 🔧 Oprava chyby 500 - RLS Policies

## Problém

Chyba 500 je způsobená tím, že **RLS (Row Level Security) policies** jsou příliš restriktivní nebo chybí policy pro INSERT do `users`.

## ✅ Řešení

### Krok 1: Spusť opravené RLS policies

1. Otevři **Supabase Dashboard** → **SQL Editor**
2. Zkopíruj obsah souboru `supabase/migrations/002_fix_rls_policies.sql`
3. Vlož do SQL Editor a klikni **Run**

### Krok 2: Zkontroluj, že tabulky existují

Spusť v SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Měly by být vidět: `users`, `games`, `game_rounds`, `locations`

### Krok 3: Zkontroluj lokace

```sql
SELECT COUNT(*) FROM locations;
```

Pokud je 0, spusť: `npm run seed`

### Krok 4: Zkus znovu

Restartuj dev server a zkus znovu spustit hru.

## 🔍 Co bylo opraveno:

1. ✅ Přidána **chybějící policy** pro INSERT do `users` - to bylo hlavní problém!
2. ✅ Zjednodušeny policies pro `games` a `game_rounds`
3. ✅ Přidán lepší error handling v API routes

## 📝 Pokud problém přetrvává:

1. **Zkontroluj konzoli serveru** (kde běží `npm run dev`)
2. **Zkontroluj Network tab** v Developer Tools → Response tab
3. **Zkontroluj Supabase Dashboard** → Logs → API Logs

Pošli mi error message z konzole!
