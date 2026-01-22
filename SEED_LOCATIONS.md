# 🌱 Jak naplnit databázi lokacemi

## Problém
V databázi není dostatek lokací (potřebuješ alespoň 5).

## ✅ Řešení

### Varianta 1: Použít seed script (doporučeno)

**Krok 1: Přidej Service Role Key do `.env.local`**

V Supabase Dashboard → Settings → API → zkopíruj **service_role** key (⚠️ NIKDY ho necommitněte!)

Přidej do `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Krok 2: Spusť seed**
```bash
npm run seed
```

### Varianta 2: Přidat lokace ručně v Supabase Dashboard

1. Otevři **Supabase Dashboard** → **Table Editor** → `locations`
2. Klikni **Insert row**
3. Přidej lokace podle `data/locations.json`:

**Minimálně potřebuješ 5 lokací:**

1. **Eiffelova věž, Paříž**
   - title: `Eiffelova věž, Paříž`
   - pano_url: `/pano.jpg` (nebo URL na Cloudinary)
   - lat: `48.8584`
   - lng: `2.2945`
   - country: `Francie`
   - region: `Île-de-France`

2. **Big Ben, Londýn**
   - title: `Big Ben, Londýn`
   - pano_url: `/pano.jpg`
   - lat: `51.4994`
   - lng: `-0.1245`
   - country: `Velká Británie`
   - region: `Anglie`

3. **Koloseum, Řím**
   - title: `Koloseum, Řím`
   - pano_url: `/pano.jpg`
   - lat: `41.8902`
   - lng: `12.4922`
   - country: `Itálie`
   - region: `Lazio`

4. **Sagrada Família, Barcelona**
   - title: `Sagrada Família, Barcelona`
   - pano_url: `/pano.jpg`
   - lat: `41.4036`
   - lng: `2.1744`
   - country: `Španělsko`
   - region: `Katalánsko`

5. **Brandenburg Gate, Berlín**
   - title: `Brandenburg Gate, Berlín`
   - pano_url: `/pano.jpg`
   - lat: `52.5163`
   - lng: `13.3777`
   - country: `Německo`
   - region: `Berlín`

### Varianta 3: Použít SQL INSERT

Spusť v Supabase SQL Editor:

```sql
INSERT INTO locations (title, pano_url, lat, lng, country, region) VALUES
('Eiffelova věž, Paříž', '/pano.jpg', 48.8584, 2.2945, 'Francie', 'Île-de-France'),
('Big Ben, Londýn', '/pano.jpg', 51.4994, -0.1245, 'Velká Británie', 'Anglie'),
('Koloseum, Řím', '/pano.jpg', 41.8902, 12.4922, 'Itálie', 'Lazio'),
('Sagrada Família, Barcelona', '/pano.jpg', 41.4036, 2.1744, 'Španělsko', 'Katalánsko'),
('Brandenburg Gate, Berlín', '/pano.jpg', 52.5163, 13.3777, 'Německo', 'Berlín');
```

## ✅ Po přidání lokací

Zkus znovu spustit hru - mělo by to fungovat!

## 💡 Tip

Pro lepší hru můžeš přidat více lokací (v `data/locations.json` jich je 20+). Stačí spustit `npm run seed` znovu - použije `upsert`, takže duplikáty se nepřidají.
