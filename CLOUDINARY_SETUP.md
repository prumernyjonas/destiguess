# ⚠️ Cloudinary není nakonfigurované

Aplikace funguje, ale **nahrávání avatarů není dostupné**, protože chybí Cloudinary konfigurace.

## 🔧 Jak to opravit:

### 1. Vytvoř účet na Cloudinary
- Jdi na [cloudinary.com](https://cloudinary.com)
- Vytvoř si účet (zdarma)

### 2. Získej Cloudinary credentials
Po přihlášení v **Dashboard** najdeš:
- **Cloud name** (např. `my-cloud-name`)
- **API Key** (číslo)
- **API Secret** (dlouhý řetězec)

### 3. Vytvoř Upload Preset
1. Jdi do **Settings** → **Upload**
2. Klikni na **Add upload preset**
3. Nastav:
   - **Preset name**: `destiguess-avatars`
   - **Signing mode**: `Unsigned`
   - **Folder**: `avatars` (volitelné)
4. Ulož

### 4. Přidej do `.env.local`

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=destiguess-avatars
```

### 5. Restartuj dev server

```bash
# Zastav server (Ctrl+C)
npm run dev
```

## ✅ Po nastavení

- Upload tlačítko u avatara bude aktivní
- Budeš moct nahrávat obrázky avatarů
- Obrázky se budou ukládat na Cloudinary

## 💡 Poznámka

Pokud nechceš používat Cloudinary, můžeš:
- Použít jiný image hosting (např. Supabase Storage)
- Nebo nechat avatary vypnuté

Aplikace funguje i bez Cloudinary - pouze nahrávání avatarů nebude dostupné.
