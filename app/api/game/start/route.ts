import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId: string | undefined;
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: user.id },
      });
      if (dbUser) {
        userId = dbUser.id;
      } else {
        // Create user if doesn't exist
        const newUser = await prisma.user.create({
          data: {
            supabaseId: user.id,
            email: user.email!,
            username: user.user_metadata?.username || user.email?.split('@')[0] || null,
          },
        });
        userId = newUser.id;
      }
    }

    // Get all locations
    const allLocations = await prisma.location.findMany();
    
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
    const game = await prisma.game.create({
      data: {
        userId,
        rounds: {
          create: selectedLocations.map((location, index) => ({
            roundIndex: index + 1,
            locationId: location.id,
          })),
        },
      },
      include: {
        rounds: {
          include: {
            location: true,
          },
        },
      },
    });

    // Return gameId and first round (only panoUrl, no coordinates)
    const firstRound = game.rounds[0];
    
    return NextResponse.json({
      gameId: game.id,
      round: {
        roundIndex: firstRound.roundIndex,
        panoUrl: firstRound.location.panoUrl,
      },
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}
