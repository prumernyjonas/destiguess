# Supabase Setup - Bez Prisma!

Tento projekt nyní používá **pouze Supabase** místo Prisma. Setup je mnohem jednodušší!

## 🚀 Rychlý start

### 1. Spusťte SQL migraci v Supabase

1. Otevřete Supabase Dashboard → **SQL Editor**
2. Zkopírujte obsah souboru `supabase/migrations/001_initial_schema.sql`
3. Vložte do SQL Editor a spusťte (Run)

Tím se vytvoří všechny potřebné tabulky v databázi.

### 2. Naplňte databázi seed daty

Vytvořte soubor `.env.local` a přidejte:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Service Role Key najdete v:** Supabase Dashboard → Settings → API → `service_role` key (⚠️ NIKDY ho necommitněte!)

Pak spusťte:

```bash
npx tsx supabase/seed.ts
```

### 3. Hotovo! 🎉

Nyní můžete spustit aplikaci:

```bash
npm run dev
```

## 📝 Co se změnilo

- ❌ **Odstraněno:** Prisma, Prisma migrace, Prisma generate
- ✅ **Používá se:** Supabase client přímo
- ✅ **Jednodušší:** Žádné Prisma závislosti
- ✅ **Rychlejší setup:** Pouze SQL migrace v Supabase Dashboard

## 🔑 Environment Variables

Potřebujete pouze:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  # Pouze pro seed script

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
```

**Poznámka:** `DATABASE_URL` už není potřeba!

## 📚 Další dokumentace

- `API_KEYS.md` - Kde získat všechny API klíče
- `PRODUCTION_SETUP.md` - Detailní instrukce (aktualizováno pro Supabase)
