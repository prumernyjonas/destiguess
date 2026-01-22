import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const rounds = await prisma.gameRound.findMany({
      where: {
        gameId,
      },
      include: {
        location: true,
      },
      orderBy: {
        roundIndex: 'asc',
      },
    });

    // Calculate total score
    const totalScore = rounds
      .filter((r) => r.score !== null)
      .reduce((sum, r) => sum + (r.score || 0), 0);

    // Update game
    const game = await prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        finishedAt: new Date(),
        totalScore,
      },
    });

    return NextResponse.json({
      gameId: game.id,
      totalScore: game.totalScore,
      finishedAt: game.finishedAt,
      rounds: rounds.map((round) => ({
        roundIndex: round.roundIndex,
        locationTitle: round.location.title,
        guessLat: round.guessLat,
        guessLng: round.guessLng,
        correctLat: round.location.lat,
        correctLng: round.location.lng,
        distanceKm: round.distanceKm,
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
