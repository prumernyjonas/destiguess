import { createClient } from '@supabase/supabase-js';
import locationsData from '../data/locations.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Použijte service role key pro seed

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🌱 Starting seed...');

  // Vložení lokací
  console.log('📍 Inserting locations...');
  const locations = locationsData.map((loc: any) => {
    // Podpora pro imageUrls (pole) nebo imageUrl (string)
    const imageUrls = Array.isArray(loc.imageUrls) 
      ? loc.imageUrls
      : loc.imageUrl || loc.panoUrl
        ? [loc.imageUrl || loc.panoUrl]
        : [];
    
    // Vybrat náhodný obrázek pro image_url (pro zpětnou kompatibilitu)
    const imageUrl = imageUrls.length > 0 
      ? imageUrls[Math.floor(Math.random() * imageUrls.length)]
      : null;
    
    return {
      title: loc.title,
      image_url: imageUrl,
      image_urls: imageUrls, // Uložit všechny obrázky jako JSON pole
      lat: loc.lat,
      lng: loc.lng,
      country: loc.country || null,
      region: loc.region || null,
    };
  });

  const { data: insertedLocations, error: locationsError } = await supabase
    .from('locations')
    .upsert(locations, { onConflict: 'title' })
    .select();

  if (locationsError) {
    console.error('Error inserting locations:', locationsError);
    process.exit(1);
  }

  console.log(`✅ Inserted ${insertedLocations?.length || 0} locations`);

  console.log('🎉 Seed completed successfully!');
}

seed()
  .catch((error) => {
    console.error('Error during seed:', error);
    process.exit(1);
  });
