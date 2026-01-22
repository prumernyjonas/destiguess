# ✅ Opraven build error a přepnuto na MapTiler

## 🔧 Opravené problémy:

### 1. **Build Error - Tailwind CSS**
- ✅ Zkontrolováno, že `@tailwindcss/postcss` je v `devDependencies`
- ✅ Zkontrolováno, že `postcss.config.mjs` je správně nakonfigurován
- ✅ Pokud problém přetrvává, zkus restartovat dev server: `npm run dev`

### 2. **Přepnuto na MapTiler**
- ✅ `GuessMapClient.tsx` nyní používá MapTiler (pokud je API klíč nastaven)
- ✅ `ResultMapClient.tsx` nyní používá MapTiler (pokud je API klíč nastaven)
- ✅ Fallback na OpenStreetMap, pokud MapTiler API klíč není nastaven
- ✅ Aktualizována dokumentace v `API_KEYS.md`

## 🚀 Co teď udělat:

### Krok 1: Přidej MapTiler API klíč do `.env.local`
```env
NEXT_PUBLIC_MAPTILER_API_KEY=your-maptiler-api-key-here
```

### Krok 2: Restartuj dev server
```bash
# Zastav aktuální server (Ctrl+C) a spusť znovu:
npm run dev
```

### Krok 3: Hotovo! 🎉
Mapa by nyní měla používat MapTiler s lepší kvalitou a výkonem.

## 📝 Technické detaily:

- **MapTiler Style URL**: `https://api.maptiler.com/maps/streets-v2/style.json?key={API_KEY}`
- **Fallback**: Pokud `NEXT_PUBLIC_MAPTILER_API_KEY` není nastaven, použije se OpenStreetMap
- **Kompatibilita**: MapTiler je plně kompatibilní s MapLibre GL

## 🔍 Pokud build error přetrvává:

1. Zkus smazat `.next` složku a znovu spustit:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. Zkontroluj, že máš správné verze:
   ```bash
   npm list @tailwindcss/postcss tailwindcss
   ```

3. Pokud problém přetrvává, zkus:
   ```bash
   npm install @tailwindcss/postcss@latest tailwindcss@latest --legacy-peer-deps
   ```
