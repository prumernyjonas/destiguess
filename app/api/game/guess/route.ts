import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';
import { haversineKm, scoreFromDistance } from '@/lib/geo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, roundIndex, guessLat, guessLng } = body;

    if (!gameId || !roundIndex || guessLat === undefined || guessLng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: gameId, roundIndex, guessLat, guessLng' },
        { status: 400 }
      );
    }

    // Get the round with location
    const round = await db.getRoundByGameAndIndex(gameId, roundIndex);

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    if (round.guessed_at) {
      return NextResponse.json(
        { error: 'Round already guessed' },
        { status: 400 }
      );
    }

    // Calculate distance
    const distanceKm = haversineKm(
      round.location.lat,
      round.location.lng,
      guessLat,
      guessLng
    );

    // Calculate score
    const score = scoreFromDistance(distanceKm);

    // Update round
    await db.updateGameRound(round.id, {
      guess_lat: guessLat,
      guess_lng: guessLng,
      distance_km: distanceKm,
      score,
      guessed_at: new Date().toISOString(),
    });

    // Calculate total score so far
    const allRounds = await db.getGameRoundsByGameId(gameId);

    const totalScoreSoFar = allRounds
      .filter((r) => r.score !== null)
      .reduce((sum, r) => sum + (r.score || 0), 0);

    return NextResponse.json({
      distanceKm: Math.round(distanceKm * 100) / 100, // Round to 2 decimals
      score,
      correctLat: round.location?.lat,
      correctLng: round.location?.lng,
      totalScoreSoFar,
    });
  } catch (error) {
    console.error('Error processing guess:', error);
    return NextResponse.json(
      { error: 'Failed to process guess' },
      { status: 500 }
    );
  }
}
