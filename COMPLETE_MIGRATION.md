# 🔧 Kompletní řešení - Přejmenování sloupce + Seed dat

## Problém

Sloupec `image_url` ještě neexistuje - tabulka má stále `pano_url`.

## ✅ Řešení - Kompletní migrace

Spusť v Supabase SQL Editor obsah souboru:
**`supabase/migrations/006_complete_migration.sql`**

Tento SQL:
1. ✅ Přejmenuje `pano_url` → `image_url` (pokud ještě neexistuje)
2. ✅ Přidá unique constraint na `title` (pokud ještě neexistuje)
3. ✅ Přidá všechny lokace s obrázky z Unsplash

## 📝 Co tento SQL dělá:

```sql
-- 1. Přejmenuje sloupec (bezpečně - kontroluje, jestli existuje)
ALTER TABLE locations RENAME COLUMN pano_url TO image_url;

-- 2. Přidá unique constraint
ALTER TABLE locations ADD CONSTRAINT locations_title_unique UNIQUE (title);

-- 3. Přidá lokace s obrázky
INSERT INTO locations (...) VALUES (...)
ON CONFLICT (title) DO UPDATE SET image_url = EXCLUDED.image_url;
```

## 🚀 Po spuštění

- ✅ Sloupec bude přejmenován
- ✅ Bude přidáno 20 lokací s obrázky
- ✅ Můžeš znovu spustit hru

---

**Stačí spustit jeden SQL soubor a vše bude hotové!** 🎉
