import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/supabase-db';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId: string | undefined;
    if (user) {
      let dbUser = await db.getUserBySupabaseId(user.id);
      if (!dbUser) {
        // Create user if doesn't exist
        dbUser = await db.createUser({
          supabase_id: user.id,
          email: user.email!,
          username: user.user_metadata?.username || user.email?.split('@')[0] || null,
        });
      }
      userId = dbUser.id;
    }

    // Get all locations
    const allLocations = await db.getAllLocations();
    
    if (allLocations.length < 5) {
      return NextResponse.json(
        { error: 'Not enough locations in database. Need at least 5.' },
        { status: 400 }
      );
    }

    // Select 5 random distinct locations
    const shuffled = [...allLocations].sort(() => 0.5 - Math.random());
    const selectedLocations = shuffled.slice(0, 5);

    // Create game
    const game = await db.createGame({
      user_id: userId || null,
      total_score: 0,
    });

    // Create rounds
    const rounds = await db.createGameRounds(
      selectedLocations.map((location, index) => ({
        game_id: game.id,
        round_index: index + 1,
        location_id: location.id,
      }))
    );

    // Get first round with location
    const firstRound = await db.getRoundByGameAndIndex(game.id, 1);
    
    if (!firstRound || !firstRound.location) {
      throw new Error('Failed to fetch first round with location');
    }
    
    // Vybrat náhodný obrázek z pole image_urls (pokud existuje), jinak použít image_url
    let imageUrl = firstRound.location.image_url;
    if (firstRound.location.image_urls && Array.isArray(firstRound.location.image_urls) && firstRound.location.image_urls.length > 0) {
      const randomIndex = Math.floor(Math.random() * firstRound.location.image_urls.length);
      imageUrl = firstRound.location.image_urls[randomIndex];
    }
    
    return NextResponse.json({
      gameId: game.id,
      round: {
        roundIndex: firstRound.round_index,
        imageUrl: imageUrl,
      },
    });
  } catch (error) {
    console.error('Error starting game:', error);
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
    } : { message: String(error) };
    
    return NextResponse.json(
      { 
        error: 'Failed to start game', 
        details: errorDetails.message,
        ...(process.env.NODE_ENV === 'development' && { stack: errorDetails.stack })
      },
      { status: 500 }
    );
  }
}
