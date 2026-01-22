import { NextResponse } from 'next/server';
import { db } from '@/lib/supabase-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing gameId' },
        { status: 400 }
      );
    }

    // Get all rounds with locations
    const rounds = await db.getGameRoundsByGameId(gameId);

    // Calculate total score
    const totalScore = rounds
      .filter((r) => r.score !== null)
      .reduce((sum, r) => sum + (r.score || 0), 0);

    // Update game
    const game = await db.updateGame(gameId, {
      finished_at: new Date().toISOString(),
      total_score: totalScore,
    });

    return NextResponse.json({
      gameId: game.id,
      totalScore: game.total_score,
      finishedAt: game.finished_at,
      rounds: rounds.map((round: any) => ({
        roundIndex: round.round_index,
        locationTitle: round.location?.title,
        guessLat: round.guess_lat,
        guessLng: round.guess_lng,
        correctLat: round.location?.lat,
        correctLng: round.location?.lng,
        distanceKm: round.distance_km,
        score: round.score,
      })),
    });
  } catch (error) {
    console.error('Error finishing game:', error);
    return NextResponse.json(
      { error: 'Failed to finish game' },
      { status: 500 }
    );
  }
}
