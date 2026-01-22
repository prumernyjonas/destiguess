# DestiGuess - Production Setup Guide

Tento dokument popisuje, jak nastavit DestiGuess pro production deployment s Supabase a Cloudinary.

## Požadované služby a API klíče

### 1. Supabase (Autentifikace + Databáze)

1. Vytvořte účet na [supabase.com](https://supabase.com)
2. Vytvořte nový projekt
3. Po vytvoření projektu přejděte do **Settings** → **API**
4. Zkopírujte následující hodnoty:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 2. Cloudinary (Obrázky)

1. Vytvořte účet na [cloudinary.com](https://cloudinary.com)
2. Po přihlášení přejděte do **Dashboard**
3. Zkopírujte následující hodnoty:
   - **Cloud name** (CLOUDINARY_CLOUD_NAME)
   - **API Key** (CLOUDINARY_API_KEY)
   - **API Secret** (CLOUDINARY_API_SECRET)

4. Nastavení Upload Preset:
   - Přejděte do **Settings** → **Upload**
   - Klikněte na **Add upload preset**
   - Nastavte:
     - **Preset name**: `destiguess-avatars` (nebo jiný název)
     - **Signing mode**: `Unsigned` (pro jednoduchost)
     - **Folder**: `avatars` (volitelné)
   - Zkopírujte **Preset name** (NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

### 3. PostgreSQL Databáze

Můžete použít Supabase PostgreSQL nebo vlastní instanci.

#### Varianta A: Použití Supabase PostgreSQL
- V Supabase projektu přejděte do **Settings** → **Database**
- Zkopírujte **Connection string** (DATABASE_URL)
- Použijte formát: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

#### Varianta B: Lokální PostgreSQL (pro vývoj)
- Použijte Docker Compose (soubor `docker-compose.yml`)
- Spusťte: `docker compose up -d`
- DATABASE_URL: `postgresql://destiguess:destiguess123@localhost:5432/destiguess?schema=public`

## Nastavení proměnných prostředí

Vytvořte soubor `.env.local` v kořenovém adresáři projektu:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=destiguess-avatars

# Database
DATABASE_URL=your_postgresql_connection_string
```

## Nastavení databáze

### 1. Spusťte Prisma migrace

```bash
npm run prisma:migrate
```

Tím se vytvoří všechny potřebné tabulky v databázi.

### 2. Vygenerujte Prisma klienta

```bash
npm run prisma:generate
```

### 3. Naplňte databázi seed daty

```bash
npm run prisma:seed
```

## Nahrání obrázků na Cloudinary

### Příprava obrázků zemí

1. Připravte 360° panoramatické obrázky (equirectangular formát) různých lokací
2. Nahrajte je na Cloudinary:
   - Můžete použít Cloudinary Dashboard
   - Nebo použít API/CLI

### Aktualizace databáze s Cloudinary URL

Po nahrání obrázků na Cloudinary:

1. Získejte URL obrázků z Cloudinary (formát: `https://res.cloudinary.com/[cloud_name]/image/upload/[path]/[filename].jpg`)
2. Aktualizujte `data/locations.json` s novými URL
3. Spusťte znovu seed: `npm run prisma:seed`

Nebo můžete použít Prisma Studio pro úpravu dat přímo:

```bash
npm run prisma:studio
```

## Struktura databáze

### Tabulky:

- **users** - Uživatelské účty
  - `id` (UUID)
  - `supabase_id` (String, unique)
  - `email` (String, unique)
  - `username` (String, nullable, unique)
  - `avatar_url` (String, nullable)
  - `created_at`, `updated_at`

- **games** - Herní sezení
  - `id` (UUID)
  - `user_id` (UUID, nullable, foreign key → users)
  - `created_at`, `finished_at`
  - `total_score` (Int)

- **game_rounds** - Kola v rámci hry
  - `id` (UUID)
  - `game_id` (UUID, foreign key → games)
  - `round_index` (Int)
  - `location_id` (UUID, foreign key → locations)
  - `guess_lat`, `guess_lng` (Float, nullable)
  - `distance_km` (Float, nullable)
  - `score` (Int, nullable)
  - `guessed_at` (DateTime, nullable)

- **locations** - Lokace pro hru
  - `id` (UUID)
  - `title` (String)
  - `pano_url` (String) - URL na Cloudinary nebo jiný hosting
  - `lat`, `lng` (Float)
  - `country`, `region` (String, nullable)
  - `created_at`

## Deployment

### Vercel (Doporučeno)

1. Pushněte kód na GitHub/GitLab/Bitbucket
2. Připojte repozitář k Vercel
3. Přidejte všechny environment variables v Vercel Dashboard
4. Deploy!

### Environment Variables v Vercel:

Přidejte všechny proměnné z `.env.local` do Vercel Dashboard → Settings → Environment Variables.

## Bezpečnost

⚠️ **DŮLEŽITÉ:**

- **NIKDY** necommitněte `.env.local` do Git
- `.env.local` je již v `.gitignore`
- Používejte Supabase RLS (Row Level Security) pro produkci
- Cloudinary API Secret je citlivý údaj - používejte ho pouze na serveru

## Testování

Po nastavení:

1. Spusťte dev server: `npm run dev`
2. Otevřete `http://localhost:3000`
3. Zaregistrujte se na `/auth`
4. Vytvořte profil na `/profile`
5. Spusťte hru na `/play`

## Troubleshooting

### Problém: "Not enough locations in database"
- Spusťte seed: `npm run prisma:seed`
- Zkontrolujte, že máte alespoň 5 lokací v databázi

### Problém: Supabase auth nefunguje
- Zkontrolujte, že máte správně nastavené `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Zkontrolujte, že middleware je správně nastaven

### Problém: Cloudinary upload nefunguje
- Zkontrolujte, že máte správně nastavený upload preset
- Zkontrolujte, že preset je nastaven jako "Unsigned" nebo máte správně nastavené API klíče

### Problém: MapLibre mapa se nezobrazuje
- Zkontrolujte konzoli prohlížeče pro chyby
- Ujistěte se, že `maplibre-gl` CSS je správně importován

## Podpora

Pro další pomoc:
- [Supabase Docs](https://supabase.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [MapLibre Docs](https://maplibre.org/maplibre-gl-js-docs/)
- [Next.js Docs](https://nextjs.org/docs)
