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

    console.log('[finish] Starting finish game for:', gameId);

    // Get all rounds with locations
    let rounds;
    try {
      rounds = await db.getGameRoundsByGameId(gameId);
      console.log('[finish] Got rounds:', rounds?.length || 0);
    } catch (error) {
      console.error('[finish] Error getting rounds:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { 
          error: 'Nepodařilo se načíst kola', 
          details: errorMessage,
          step: 'get_rounds'
        },
        { status: 500 }
      );
    }

    if (!rounds || rounds.length === 0) {
      return NextResponse.json(
        { error: 'No rounds found for this game', details: `GameId: ${gameId}` },
        { status: 404 }
      );
    }

    // Calculate total score
    const totalScore = rounds
      .filter((r) => r.score !== null)
      .reduce((sum, r) => sum + (r.score || 0), 0);

    console.log('[finish] Calculated total score:', totalScore);

    // Update game
    let game;
    try {
      game = await db.updateGame(gameId, {
        finished_at: new Date().toISOString(),
        total_score: totalScore,
      });
      console.log('[finish] Game updated successfully:', game.id);
    } catch (error) {
      console.error('[finish] Error updating game:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code;
      const errorDetails = (error as any)?.details;
      
      // Pokud je to RLS chyba, poskytneme užitečnou zprávu
      if (errorCode === '42501' || errorMessage.includes('permission') || errorMessage.includes('policy')) {
        return NextResponse.json(
          { 
            error: 'Nepodařilo se dokončit hru - chybějící oprávnění', 
            details: 'Zkontroluj, zda je aplikovaná migrace 008_add_games_update_policy.sql v Supabase',
            errorCode,
            errorDetails,
            step: 'update_game'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Nepodařilo se aktualizovat hru', 
          details: errorMessage,
          errorCode,
          errorDetails,
          step: 'update_game'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      gameId: game.id,
      totalScore: game.total_score,
      finishedAt: game.finished_at,
      rounds: rounds.map((round: any) => ({
        roundIndex: round.round_index,
        locationTitle: round.location?.title || 'Neznámá lokace',
        guessLat: round.guess_lat,
        guessLng: round.guess_lng,
        correctLat: round.location?.lat,
        correctLng: round.location?.lng,
        distanceKm: round.distance_km || 0,
        score: round.score || 0,
      })),
    });
  } catch (error) {
    console.error('[finish] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Failed to finish game';
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { 
        error: 'Nepodařilo se dokončit hru', 
        details: message,
        stack: process.env.NODE_ENV === 'development' ? stack : undefined
      },
      { status: 500 }
    );
  }
}
