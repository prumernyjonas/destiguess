# DestiGuess - Production Upgrade - Souhrn změn

## ✅ Dokončené úkoly

### 1. ✅ Supabase integrace
- Nainstalován `@supabase/supabase-js` a `@supabase/ssr`
- Vytvořen Supabase klient pro browser (`lib/supabase/client.ts`)
- Vytvořen Supabase klient pro server (`lib/supabase/server.ts`)
- Vytvořen middleware pro refresh session (`middleware.ts`)

### 2. ✅ Cloudinary integrace
- Nainstalován `cloudinary` a `next-cloudinary`
- Vytvořen Cloudinary klient (`lib/cloudinary.ts`)
- Přidána podpora pro nahrávání avatarů

### 3. ✅ Databázové schéma
- Přidán `User` model do Prisma schema
- Propojeno `Game` s `User` (volitelná vazba)
- Přidána podpora pro avatary (`avatarUrl`)

### 4. ✅ Autentifikace
- Vytvořena stránka `/auth` pro login/registraci
- Implementována registrace s username
- Implementován login
- Automatická synchronizace uživatelů s databází

### 5. ✅ Uživatelský profil
- Vytvořena stránka `/profile`
- Zobrazení profilu uživatele
- Nahrávání a změna avatara přes Cloudinary
- Zobrazení username a emailu

### 6. ✅ MapLibre integrace
- Přepnuto z Leaflet na MapLibre GL
- Vytvořen nový `GuessMapClient` s MapLibre
- Vytvořen nový `ResultMapClient` s MapLibre
- Vylepšený design markerů
- Podpora pro linie mezi body na výsledkové mapě

### 7. ✅ Design vylepšení
- Přidána navigační lišta (`components/Navigation.tsx`)
- Zobrazení avatara v navigaci
- Vylepšený glassmorphism design
- Responzivní layout
- Smooth animace

### 8. ✅ Dokumentace
- Vytvořen `PRODUCTION_SETUP.md` s kompletními instrukcemi
- Vytvořen `API_KEYS.md` s detaily o všech API klíčích
- Instrukce pro deployment

## 📁 Nové soubory

### Komponenty
- `components/Navigation.tsx` - Navigační lišta
- `components/GuessMapClient.tsx` - MapLibre mapa pro tipování (přepsáno)
- `components/ResultMapClient.tsx` - MapLibre mapa pro výsledky (přepsáno)

### Stránky
- `app/auth/page.tsx` - Login/Registrace
- `app/profile/page.tsx` - Uživatelský profil

### API Routes
- `app/api/user/profile/route.ts` - Získání profilu uživatele
- `app/api/user/avatar/route.ts` - Aktualizace avatara
- `app/api/user/sync/route.ts` - Synchronizace Supabase uživatele s DB

### Utility
- `lib/supabase/client.ts` - Supabase browser klient
- `lib/supabase/server.ts` - Supabase server klient
- `lib/cloudinary.ts` - Cloudinary konfigurace
- `middleware.ts` - Next.js middleware pro Supabase

### Dokumentace
- `PRODUCTION_SETUP.md` - Kompletní setup guide
- `API_KEYS.md` - Detaily o API klíčích

## 🔄 Upravené soubory

### Schema
- `prisma/schema.prisma` - Přidán User model, propojeno s Game

### Stránky
- `app/layout.tsx` - Přidána navigace
- `app/play/page.tsx` - Aktualizováno pro použití panoUrl z API, přidán padding pro navigaci
- `app/auth/page.tsx` - Přidána synchronizace uživatele po registraci

### API Routes
- `app/api/game/start/route.ts` - Přidána podpora pro userId

### Konfigurace
- `next.config.ts` - Přidána podpora pro Cloudinary obrázky
- `package.json` - Přidány nové závislosti

## 📦 Nové závislosti

```json
{
  "@supabase/supabase-js": "^2.91.0",
  "@supabase/ssr": "^0.8.0",
  "cloudinary": "^2.9.0",
  "next-cloudinary": "^6.17.5",
  "maplibre-gl": "^5.16.0",
  "@types/maplibre-gl": "^1.13.2",
  "react-map-gl": "^8.1.0"
}
```

## 🔑 Potřebné environment variables

Viz `API_KEYS.md` pro kompletní seznam.

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Cloudinary
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### Database
- `DATABASE_URL`

## 🚀 Další kroky pro deployment

1. **Nastavte Supabase**
   - Vytvořte projekt na supabase.com
   - Zkopírujte URL a anon key

2. **Nastavte Cloudinary**
   - Vytvořte účet na cloudinary.com
   - Vytvořte upload preset pro avatary
   - Zkopírujte credentials

3. **Nastavte databázi**
   - Použijte Supabase PostgreSQL nebo vlastní instanci
   - Spusťte migrace: `npm run prisma:migrate`
   - Vygenerujte klienta: `npm run prisma:generate`
   - Naplňte seed daty: `npm run prisma:seed`

4. **Nahrajte obrázky na Cloudinary**
   - Připravte 360° panoramatické obrázky
   - Nahrajte je na Cloudinary
   - Aktualizujte `data/locations.json` s Cloudinary URL
   - Spusťte znovu seed

5. **Deploy na Vercel**
   - Přidejte všechny environment variables
   - Deploy!

## 📝 Poznámky

- Leaflet závislosti jsou stále v `package.json`, ale nejsou používány (můžete je odstranit)
- MapLibre používá OpenStreetMap tiles (zdarma, žádný API klíč nepotřebný)
- Supabase RLS (Row Level Security) není nastaveno - doporučuji nastavit pro produkci
- Cloudinary upload preset by měl být "Unsigned" pro jednoduchost, nebo můžete použít signed upload s API secret

## 🐛 Známé problémy / TODO

- [ ] Přidat RLS policies v Supabase
- [ ] Přidat error handling pro Cloudinary upload
- [ ] Přidat loading states pro lepší UX
- [ ] Přidat validaci formulářů
- [ ] Přidat email verification flow
- [ ] Přidat reset hesla funkcionalitu
- [ ] Optimalizovat obrázky přes Cloudinary transformations
- [ ] Přidat leaderboard/statistiky uživatelů
