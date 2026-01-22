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

    // Return only panoUrl, not coordinates
    return NextResponse.json({
      roundIndex: round.round_index,
      panoUrl: round.location.pano_url,
    });
  } catch (error) {
    console.error('Error fetching round:', error);
    return NextResponse.json(
      { error: 'Failed to fetch round' },
      { status: 500 }
    );
  }
}
