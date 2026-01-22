# 🔍 Debugging - Chyba 500 při spuštění hry

## Možné příčiny:

1. **Tabulky v Supabase nejsou vytvořené**
   - Spusť SQL migraci v Supabase Dashboard → SQL Editor
   - Soubor: `supabase/migrations/001_initial_schema.sql`

2. **Databáze je prázdná (žádné lokace)**
   - Spusť: `npm run seed`
   - Nebo přidej lokace ručně v Supabase Dashboard

3. **Chyba v Supabase dotazu**
   - Zkontroluj konzoli serveru (kde běží `npm run dev`)
   - Měly by se zobrazit detaily chyby

## Jak zkontrolovat:

1. **Zkontroluj Supabase Dashboard:**
   - Table Editor → měly by být tabulky: `users`, `games`, `game_rounds`, `locations`
   - Pokud nejsou → spusť SQL migraci

2. **Zkontroluj, jestli jsou lokace:**
   - Table Editor → `locations` → mělo by být alespoň 5 lokací
   - Pokud nejsou → spusť `npm run seed`

3. **Zkontroluj konzoli:**
   - V terminálu kde běží `npm run dev` by měly být error logy
   - Zkopíruj chybovou hlášku

## Rychlé řešení:

```bash
# 1. Spusť SQL migraci v Supabase Dashboard
# 2. Pak spusť seed
npm run seed

# 3. Zkontroluj, že jsou lokace v databázi
# 4. Zkus znovu spustit hru
```

Pokud problém přetrvává, pošli mi error z konzole serveru!
