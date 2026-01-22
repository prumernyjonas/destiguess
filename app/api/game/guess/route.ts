import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    const round = await prisma.gameRound.findUnique({
      where: {
        gameId_roundIndex: {
          gameId,
          roundIndex,
        },
      },
      include: {
        location: true,
      },
    });

    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    if (round.guessedAt) {
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
    await prisma.gameRound.update({
      where: {
        id: round.id,
      },
      data: {
        guessLat,
        guessLng,
        distanceKm,
        score,
        guessedAt: new Date(),
      },
    });

    // Calculate total score so far
    const allRounds = await prisma.gameRound.findMany({
      where: {
        gameId,
      },
    });

    const totalScoreSoFar = allRounds
      .filter((r) => r.score !== null)
      .reduce((sum, r) => sum + (r.score || 0), 0);

    return NextResponse.json({
      distanceKm: Math.round(distanceKm * 100) / 100, // Round to 2 decimals
      score,
      correctLat: round.location.lat,
      correctLng: round.location.lng,
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
