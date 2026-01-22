import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, roundIndex } = body;

    if (!gameId || !roundIndex) {
      return NextResponse.json(
        { error: 'Missing gameId or roundIndex' },
        { status: 400 }
      );
    }

    const round = await db.getRoundByGameAndIndex(gameId, roundIndex);

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Vybrat náhodný obrázek z pole image_urls (pokud existuje), jinak použít image_url
    let imageUrl = round.location.image_url;
    if (round.location.image_urls && Array.isArray(round.location.image_urls) && round.location.image_urls.length > 0) {
      const randomIndex = Math.floor(Math.random() * round.location.image_urls.length);
      imageUrl = round.location.image_urls[randomIndex];
    }

    // Return only imageUrl, not coordinates
    return NextResponse.json({
      roundIndex: round.round_index,
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error('Error fetching round:', error);
    return NextResponse.json(
      { error: 'Failed to fetch round' },
      { status: 500 }
    );
  }
}
