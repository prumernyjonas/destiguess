# ✅ Přepnuto na klasické obrázky!

Projekt byl úspěšně přepnut z 360° panoramatických obrázků na klasické obrázky známých míst.

## 🎯 Co bylo změněno:

1. ✅ Databázové schéma - `pano_url` → `image_url`
2. ✅ API routes - všechny používají `imageUrl`
3. ✅ Zobrazování - klasický `<img>` tag místo panoramatického vieweru
4. ✅ Data - URL na skutečné obrázky z Unsplash
5. ✅ Odstraněna pannellum závislost

## 🚀 Co teď udělat:

### Krok 1: Spusť SQL migraci
V Supabase Dashboard → SQL Editor:
```sql
ALTER TABLE locations RENAME COLUMN pano_url TO image_url;
```

### Krok 2: Aktualizuj lokace
Spusť v Supabase SQL Editor obsah souboru `supabase/migrations/003_seed_locations.sql` (obsahuje nové URL s obrázky)

**NEBO** jednoduše:
```bash
npm run seed
```

### Krok 3: Hotovo! 🎉
Zkus znovu spustit hru - měly by se zobrazit klasické obrázky známých míst!

## 📸 Obrázky

Použil jsem obrázky z Unsplash (zdarma, vysoká kvalita):
- Eiffelova věž, Big Ben, Koloseum, Sagrada Família, atd.
- Všechny obrázky jsou optimalizované (1200x800px)

Pokud chceš použít vlastní obrázky:
1. Nahraj je na Cloudinary
2. Aktualizuj `image_url` v databázi

---

**Všechny změny jsou hotové! Stačí spustit SQL migraci.** 🚀
