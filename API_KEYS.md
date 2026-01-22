# DestiGuess - Production Setup - API Klíče

## 📋 Seznam všech potřebných API klíčů a kde je získat

### 1. Supabase (Autentifikace + Databáze)

**Kde získat:**
1. Jděte na [supabase.com](https://supabase.com) a vytvořte účet
2. Vytvořte nový projekt
3. Po vytvoření projektu:
   - Přejděte do **Settings** → **API**
   - Zkopírujte **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Zkopírujte **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Kam dát:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. Cloudinary (Obrázky)

**Kde získat:**
1. Jděte na [cloudinary.com](https://cloudinary.com) a vytvořte účet
2. Po přihlášení v **Dashboard** najdete:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

**Nastavení Upload Preset:**
1. Přejděte do **Settings** → **Upload**
2. Klikněte na **Add upload preset**
3. Nastavte:
   - **Preset name**: `destiguess-avatars` (nebo jiný název)
   - **Signing mode**: `Unsigned` (pro jednoduchost)
   - **Folder**: `avatars` (volitelné)
4. Uložte a zkopírujte **Preset name** → `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

**Kam dát:**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=destiguess-avatars
```

---

### 3. MapTiler (Mapy)

**Kde získat:**
1. Jděte na [maptiler.com](https://www.maptiler.com) a vytvořte účet
2. Po přihlášení přejděte do **Cloud** → **API keys**
3. Vytvořte nový API klíč nebo použijte existující
4. Zkopírujte **API key** → `NEXT_PUBLIC_MAPTILER_API_KEY`

**Kam dát:**
```env
NEXT_PUBLIC_MAPTILER_API_KEY=your-maptiler-api-key-here
```

**Poznámka:** Pokud MapTiler API klíč není nastaven, aplikace automaticky použije OpenStreetMap jako fallback.

---

### 4. YouTube Data API (Hudba - volitelné)

**Kde získat:**
1. Jděte na [Google Cloud Console](https://console.cloud.google.com)
2. Vytvořte nový projekt nebo vyberte existující
3. Přejděte do **APIs & Services** → **Library**
4. Vyhledejte "YouTube Data API v3" a povolte ji
5. Přejděte do **APIs & Services** → **Credentials**
6. Klikněte na **Create Credentials** → **API Key**
7. Zkopírujte **API key** → `NEXT_PUBLIC_YOUTUBE_API_KEY`

**Kam dát:**
```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key-here
```

**Poznámka:** YouTube API klíč je volitelný. Pokud není nastaven, uživatelé stále mohou používat lokální MP3 soubory z `/public/music/` složky. YouTube vyhledávání bude dostupné pouze s platným API klíčem.

---

### 5. PostgreSQL Databáze

**Varianta A: Použití Supabase PostgreSQL (Doporučeno)**

1. V Supabase projektu přejděte do **Settings** → **Database**
2. Najděte sekci **Connection string**
3. Vyberte **URI** formát
4. Zkopírujte connection string → `DATABASE_URL`

**Formát:**
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

**Kam dát:**
```env
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Varianta B: Lokální PostgreSQL (pouze pro vývoj)**

Pokud používáte lokální PostgreSQL přes Docker:
```env
DATABASE_URL=postgresql://destiguess:destiguess123@localhost:5432/destiguess?schema=public
```

---

## 📝 Kompletní .env.local soubor

Vytvořte soubor `.env.local` v kořenovém adresáři projektu:

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# CLOUDINARY CONFIGURATION
# ============================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=destiguess-avatars

# ============================================
# MAPTILER CONFIGURATION (Mapy)
# ============================================
NEXT_PUBLIC_MAPTILER_API_KEY=your-maptiler-api-key-here

# ============================================
# YOUTUBE DATA API (Hudba - volitelné)
# ============================================
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key-here

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Pro Supabase PostgreSQL:
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# NEBO pro lokální PostgreSQL (vývoj):
# DATABASE_URL=postgresql://destiguess:destiguess123@localhost:5432/destiguess?schema=public
```

---

## 🔒 Bezpečnost

⚠️ **DŮLEŽITÉ:**

1. **NIKDY** necommitněte `.env.local` do Git (je již v `.gitignore`)
2. `CLOUDINARY_API_SECRET` je citlivý údaj - používejte ho pouze na serveru
3. `NEXT_PUBLIC_*` proměnné jsou viditelné v prohlížeči - používejte pouze pro veřejné klíče
4. Pro produkci použijte environment variables v hosting platformě (Vercel, Netlify, atd.)

---

## 🚀 Deployment na Vercel

1. Pushněte kód na GitHub/GitLab/Bitbucket
2. Připojte repozitář k Vercel
3. V **Settings** → **Environment Variables** přidejte všechny proměnné z `.env.local`
4. Deploy!

---

## ✅ Kontrolní seznam

- [ ] MapTiler účet vytvořen
- [ ] `NEXT_PUBLIC_MAPTILER_API_KEY` nastaven
- [ ] YouTube Data API klíč vytvořen (volitelné)
- [ ] `NEXT_PUBLIC_YOUTUBE_API_KEY` nastaven (volitelné)
- [ ] Supabase projekt vytvořen
- [ ] `NEXT_PUBLIC_SUPABASE_URL` nastaven
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` nastaven
- [ ] Cloudinary účet vytvořen
- [ ] `CLOUDINARY_CLOUD_NAME` nastaven
- [ ] `CLOUDINARY_API_KEY` nastaven
- [ ] `CLOUDINARY_API_SECRET` nastaven
- [ ] Upload preset vytvořen a `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` nastaven
- [ ] `DATABASE_URL` nastaven (Supabase nebo lokální)
- [ ] Prisma migrace spuštěny (`npm run prisma:migrate`)
- [ ] Prisma klient vygenerován (`npm run prisma:generate`)
- [ ] Databáze naplněna seed daty (`npm run prisma:seed`)

---

## 📚 Další dokumentace

Více informací najdete v `PRODUCTION_SETUP.md`
