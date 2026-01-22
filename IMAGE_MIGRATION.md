# ✅ Změna z panoramatických obrázků na klasické obrázky

Projekt byl úspěšně přepnut z 360° panoramatických obrázků na klasické obrázky známých míst.

## 🔄 Co se změnilo:

### 1. Databázové schéma
- Sloupec `pano_url` přejmenován na `image_url`
- SQL migrace: `supabase/migrations/004_rename_pano_to_image.sql`

### 2. API Routes
- Všechny API routes nyní používají `imageUrl` místo `panoUrl`
- Aktualizováno: `app/api/game/start/route.ts`, `app/api/game/round/route.ts`

### 3. Zobrazování
- Místo panoramatického vieweru se používá klasický `<img>` tag
- Obrázky se zobrazují z Unsplash (zdarma, vysoká kvalita)
- Přidán fallback pro chybějící obrázky

### 4. Data
- `data/locations.json` obsahuje URL na skutečné obrázky známých míst
- Použity obrázky z Unsplash (20 lokací)

### 5. Odstraněno
- Pannellum závislost (už není potřeba)
- PanoViewer komponenta (můžeš smazat, pokud chceš)

## 🚀 Co teď udělat:

### 1. Spusť SQL migraci
V Supabase Dashboard → SQL Editor spusť:
```sql
-- Obsah souboru: supabase/migrations/004_rename_pano_to_image.sql
ALTER TABLE locations RENAME COLUMN pano_url TO image_url;
```

### 2. Aktualizuj existující lokace
Pokud už máš lokace v databázi, aktualizuj je:
```sql
-- Spusť v Supabase SQL Editor
UPDATE locations SET image_url = 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&h=800&fit=crop' WHERE title = 'Eiffelova věž, Paříž';
-- ... atd. pro všechny lokace
```

**NEBO** jednoduše spusť znovu seed script (použije upsert):
```bash
npm run seed
```

### 3. Hotovo! 🎉
Zkus znovu spustit hru - měly by se zobrazit klasické obrázky známých míst.

## 📝 Poznámky:

- Obrázky jsou z Unsplash (zdarma, vysoká kvalita)
- Pokud chceš použít vlastní obrázky, nahraj je na Cloudinary a aktualizuj URL v databázi
- Pannellum závislost byla odstraněna z `package.json` - můžeš smazat `components/PanoViewer.tsx` pokud chceš

## 🎨 Vylepšení designu:

Obrázky se nyní zobrazují jako klasické fotografie známých míst, což je:
- ✅ Jednodušší pro uživatele
- ✅ Rychlejší načítání
- ✅ Lepší UX (známé obrázky místo abstraktních panoramat)
- ✅ Méně závislostí

---

**Všechny změny jsou hotové! Stačí spustit SQL migraci a aktualizovat lokace.** 🚀
