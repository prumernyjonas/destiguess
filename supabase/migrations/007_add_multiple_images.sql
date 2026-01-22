-- Přidání podpory pro více obrázků na lokaci
-- Spusť tento SQL v Supabase SQL Editor

-- Krok 1: Přidat sloupec image_urls jako JSON pole (pokud ještě neexistuje)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE locations ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Krok 2: Migrovat existující image_url do image_urls pole
UPDATE locations 
SET image_urls = jsonb_build_array(image_url)
WHERE image_urls = '[]'::jsonb OR image_urls IS NULL;

-- Krok 3: Aktualizovat lokace s více obrázky (použij data z locations.json)
-- Toto je příklad - aktualizuj podle svých dat
UPDATE locations 
SET image_urls = '["https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&h=800&fit=crop", "https://images.unsplash.com/photo-1549144511-f099e773c147?w=1200&h=800&fit=crop", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop"]'::jsonb
WHERE title = 'Eiffelova věž, Paříž';

UPDATE locations 
SET image_urls = '["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop", "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop"]'::jsonb
WHERE title = 'Big Ben, Londýn';

-- Poznámka: Pro ostatní lokace použij podobný UPDATE nebo spusť seed script, který to udělá automaticky
