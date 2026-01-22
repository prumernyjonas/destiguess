-- Jednodušší seed bez ON CONFLICT - smaže všechny a přidá nové
-- Spusť tento SQL v Supabase SQL Editor

-- Smaž všechny existující lokace (volitelné - pouze pokud chceš začít znovu)
-- DELETE FROM locations;

-- Přidej lokace s obrázky
INSERT INTO locations (title, image_url, lat, lng, country, region) VALUES
('Eiffelova věž, Paříž', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&h=800&fit=crop', 48.8584, 2.2945, 'Francie', 'Île-de-France'),
('Big Ben, Londýn', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop', 51.4994, -0.1245, 'Velká Británie', 'Anglie'),
('Koloseum, Řím', 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1200&h=800&fit=crop', 41.8902, 12.4922, 'Itálie', 'Lazio'),
('Sagrada Família, Barcelona', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=800&fit=crop', 41.4036, 2.1744, 'Španělsko', 'Katalánsko'),
('Brandenburská brána, Berlín', 'https://images.unsplash.com/photo-1587330979470-3595ac045cb0?w=1200&h=800&fit=crop', 52.5163, 13.3777, 'Německo', 'Berlín'),
('Akropolis, Athény', 'https://images.unsplash.com/photo-1603574670812-d245608802a8?w=1200&h=800&fit=crop', 37.9715, 23.7268, 'Řecko', 'Attika'),
('Karlův most, Praha', 'https://images.unsplash.com/photo-1555993531-9d8a8e5e5b5b?w=1200&h=800&fit=crop', 50.0865, 14.4114, 'Česká republika', 'Praha'),
('Statue of Liberty, New York', 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop', 40.6892, -74.0445, 'USA', 'New York'),
('Golden Gate Bridge, San Francisco', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop', 37.8199, -122.4783, 'USA', 'Kalifornie'),
('Sydney Opera House', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop', -33.8568, 151.2153, 'Austrálie', 'New South Wales'),
('Tower Bridge, Londýn', 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop', 51.5055, -0.0754, 'Velká Británie', 'Anglie'),
('Notre-Dame, Paříž', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop', 48.8530, 2.3499, 'Francie', 'Île-de-France'),
('Machu Picchu, Peru', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&h=800&fit=crop', -13.1631, -72.5450, 'Peru', 'Cusco'),
('Taj Mahal, Agra', 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&h=800&fit=crop', 27.1751, 78.0421, 'Indie', 'Uttar Pradesh'),
('Christ the Redeemer, Rio de Janeiro', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&h=800&fit=crop', -22.9519, -43.2105, 'Brazílie', 'Rio de Janeiro'),
('Petra, Jordánsko', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop', 30.3285, 35.4444, 'Jordánsko', 'Ma''an'),
('Angkor Wat, Kambodža', 'https://images.unsplash.com/photo-1552461719-7a8b2b3b3b3b?w=1200&h=800&fit=crop', 13.4125, 103.8670, 'Kambodža', 'Siem Reap'),
('Mount Fuji, Japonsko', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&h=800&fit=crop', 35.3606, 138.7274, 'Japonsko', 'Shizuoka'),
('Great Wall of China, Peking', 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&h=800&fit=crop', 40.4319, 116.5704, 'Čína', 'Peking'),
('Pyramidy v Gíze, Egypt', 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=1200&h=800&fit=crop', 29.9792, 31.1342, 'Egypt', 'Gíza');

-- Zkontroluj počet lokací
SELECT COUNT(*) as total_locations FROM locations;
