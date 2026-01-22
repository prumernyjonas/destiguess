# DestiGuess - GeoGuessr-like Game

Production-ready hra podobná GeoGuessr postavená na Next.js 16, TypeScript, Prisma, Supabase a Cloudinary.

## 🎮 Funkce

- 🔐 **Autentifikace** - Registrace a přihlášení přes Supabase
- 👤 **Uživatelské profily** - Nastavení avatara, zobrazení statistik
- 🎮 **5 kol na hru** - Náhodné lokace z celého světa
- 🌍 **360° panoramatické zobrazení** - Equirectangular obrázky z Cloudinary
- 🗺️ **Interaktivní MapLibre mapa** - Moderní mapy pro umístění tipu
- 📊 **Výpočet vzdálenosti** - Pomocí Haversine formule
- 🎯 **Bodovací systém** - 0-5000 bodů na kolo
- 💾 **Ukládání her** - PostgreSQL databáze přes Supabase
- 🎨 **Moderní design** - Glassmorphism, smooth animace, responzivní layout

## 🛠️ Technologie

- **Next.js 16** (App Router) + TypeScript
- **Supabase** - Autentifikace a PostgreSQL databáze
- **Cloudinary** - Hosting obrázků a avatarů
- **Prisma** - ORM pro databázi
- **Tailwind CSS** - Styling
- **MapLibre GL** - Moderní mapy
- **Framer Motion** - Animace

## 🚀 Rychlý start

### 1. Instalace závislostí

```bash
npm install --legacy-peer-deps
```

### 2. Nastavení environment variables

Vytvořte soubor `.env.local` (viz `API_KEYS.md` pro detaily):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=destiguess-avatars

# Database
DATABASE_URL=your_postgresql_connection_string
```

### 3. Nastavení databáze

```bash
# Spusťte migrace
npm run prisma:migrate

# Vygenerujte Prisma klienta
npm run prisma:generate

# Naplňte databázi seed daty
npm run prisma:seed
```

### 4. Spusťte vývojový server

```bash
npm run dev
```

Otevřete [http://localhost:3000](http://localhost:3000) ve vašem prohlížeči.

## 📚 Dokumentace

- **[API_KEYS.md](./API_KEYS.md)** - Kompletní seznam všech API klíčů a kde je získat
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Detailní instrukce pro production deployment
- **[CHANGELOG.md](./CHANGELOG.md)** - Seznam všech změn a nových funkcí

## 📸 Nahrání obrázků na Cloudinary

1. Připravte 360° panoramatické obrázky (equirectangular formát)
2. Nahrajte je na Cloudinary (přes Dashboard nebo API)
3. Aktualizujte `data/locations.json` s Cloudinary URL
4. Spusťte znovu seed: `npm run prisma:seed`

Nebo použijte Prisma Studio pro úpravu dat přímo:

```bash
npm run prisma:studio
```

## 🏗️ Struktura projektu

```
destiguess/
├── app/
│   ├── api/
│   │   ├── game/          # Herní API routes
│   │   └── user/          # Uživatelské API routes
│   ├── auth/              # Login/Registrace
│   ├── profile/           # Uživatelský profil
│   ├── play/              # Hlavní herní stránka
│   └── layout.tsx
├── components/
│   ├── Navigation.tsx     # Navigační lišta
│   ├── GuessMap.tsx       # Mapa pro tipování (MapLibre)
│   ├── ResultMap.tsx      # Mapa s výsledky (MapLibre)
│   └── ...
├── lib/
│   ├── supabase/          # Supabase klienti
│   ├── cloudinary.ts      # Cloudinary konfigurace
│   ├── geo.ts             # Geo utility funkce
│   └── prisma.ts          # Prisma klient
├── prisma/
│   ├── schema.prisma      # Databázové schéma
│   └── seed.ts            # Seed skript
├── data/
│   └── locations.json     # Seed data s lokacemi
└── middleware.ts          # Next.js middleware pro Supabase
```

## API Endpointy

### POST `/api/game/start`
Vytvoří novou hru s 5 náhodnými lokacemi.

**Response:**
```json
{
  "gameId": "uuid",
  "round": {
    "roundIndex": 1,
    "panoUrl": "https://..."
  }
}
```

### POST `/api/game/round`
Získá další kolo ze stejné hry.

**Body:**
```json
{
  "gameId": "uuid",
  "roundIndex": 2
}
```

**Response:**
```json
{
  "roundIndex": 2,
  "panoUrl": "https://..."
}
```

### POST `/api/game/guess`
Odešle tip a vypočítá výsledky.

**Body:**
```json
{
  "gameId": "uuid",
  "roundIndex": 1,
  "guessLat": 48.8584,
  "guessLng": 2.2945
}
```

**Response:**
```json
{
  "distanceKm": 1234.56,
  "score": 2500,
  "correctLat": 48.8584,
  "correctLng": 2.2945,
  "totalScoreSoFar": 2500
}
```

### POST `/api/game/finish`
Dokončí hru a vrátí finální výsledky.

**Body:**
```json
{
  "gameId": "uuid"
}
```

**Response:**
```json
{
  "gameId": "uuid",
  "totalScore": 12500,
  "finishedAt": "2024-01-01T12:00:00Z",
  "rounds": [...]
}
```

## Bodovací systém

Body se počítají pomocí exponenciálního poklesu:
```
body = round(5000 * exp(-vzdálenostKm / 2000))
```

Výsledek je omezen na rozsah 0-5000 bodů.

## Databázové modely

- **Location**: Lokace s panoramatickými obrázky
- **Game**: Hra s celkovým skóre
- **GameRound**: Jednotlivé kolo hry s tipem a výsledky

## Scripty

- `npm run dev` - Spustí vývojový server
- `npm run build` - Vytvoří produkční build
- `npm run start` - Spustí produkční server
- `npm run prisma:migrate` - Spustí Prisma migrace
- `npm run prisma:seed` - Naplní databázi seed daty
- `npm run prisma:generate` - Vygeneruje Prisma klienta
- `npm run prisma:studio` - Otevře Prisma Studio

## Poznámky

- Leaflet mapy jsou načítány pouze na klientu (client-side only)
- Pannellum viewer podporuje equirectangular panoramatické obrázky
- Všechny komponenty jsou plně typované pomocí TypeScript
- Aplikace je responzivní (desktop i mobilní zobrazení)

## Licence

MIT
