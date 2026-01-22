-- SQL migrace: Změna z panoramatických obrázků na klasické obrázky
-- Spusť tento SQL v Supabase SQL Editor

-- Přejmenovat sloupec pano_url na image_url
ALTER TABLE locations RENAME COLUMN pano_url TO image_url;

-- Aktualizovat komentář (volitelné)
COMMENT ON COLUMN locations.image_url IS 'URL na obrázek známého místa';
