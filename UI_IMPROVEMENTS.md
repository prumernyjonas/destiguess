# ✅ Vylepšení UI a náhodné obrázky

## 🎨 Co bylo vylepšeno:

### 1. **Opravena mapa**
- ✅ Označování na mapě nyní funguje správně
- ✅ Marker má lepší animace a hover efekty
- ✅ Vylepšené vizuální zpracování

### 2. **Náhodné obrázky**
- ✅ Každá lokace má nyní pole `image_urls` s více obrázky
- ✅ Při každém spuštění hry/kola se vybere náhodný obrázek
- ✅ Vždy uvidíš jiný obrázek stejné lokace

### 3. **Vylepšené UI**
- ✅ Přidán padding všude (px-6, py-12, atd.)
- ✅ Použity ikony z `lucide-react` (MapPin, Trophy, Play, CheckCircle, atd.)
- ✅ Vylepšený Navigation s ikonami
- ✅ Lepší spacing a layout
- ✅ Vylepšené glassmorphism efekty
- ✅ Lepší hover stavy a animace

### 4. **Celkový design**
- ✅ Konzistentní padding a spacing
- ✅ Lepší vizuální hierarchie
- ✅ Vylepšené karty a komponenty
- ✅ Lepší typografie a barvy

## 🚀 Co teď udělat:

### Krok 1: Spusť SQL migraci pro více obrázků
V Supabase Dashboard → SQL Editor spusť obsah souboru:
```
supabase/migrations/007_add_multiple_images.sql
```

### Krok 2: Aktualizuj lokace s více obrázky
Spusť seed script, který automaticky přidá všechny obrázky:
```bash
npm run seed
```

**NEBO** aktualizuj ručně v Supabase SQL Editor podle `data/locations.json`:
```sql
UPDATE locations 
SET image_urls = '["url1", "url2", "url3"]'::jsonb
WHERE title = 'Název lokace';
```

### Krok 3: Hotovo! 🎉
Při každém spuštění hry se nyní zobrazí náhodný obrázek z pole `image_urls` pro každou lokaci.

## 📝 Technické detaily:

- **Databáze**: Přidán sloupec `image_urls` (JSONB) do tabulky `locations`
- **API**: `/api/game/start` a `/api/game/round` nyní vybírají náhodný obrázek z pole
- **Seed**: Seed script automaticky ukládá všechny obrázky z `locations.json` do `image_urls`
- **Zpětná kompatibilita**: Pokud `image_urls` neexistuje, použije se `image_url`

## 🎯 Výsledek:

- ✅ Mapa funguje správně
- ✅ Vždy jiný obrázek pro každou lokaci
- ✅ Vylepšené UI s paddingem a ikonami
- ✅ Modernější a konzistentnější design
