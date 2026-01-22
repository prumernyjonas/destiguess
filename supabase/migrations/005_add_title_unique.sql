-- Oprava: Přidání unique constraint na title v locations
-- Spusť tento SQL v Supabase SQL Editor PŘED importem dat

-- Přidat unique constraint na title (pokud ještě neexistuje)
ALTER TABLE locations ADD CONSTRAINT locations_title_unique UNIQUE (title);

-- Pokud už máš data a jsou duplikáty, nejdřív je odstran:
-- DELETE FROM locations WHERE id NOT IN (SELECT MIN(id) FROM locations GROUP BY title);
