'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuessMap from '@/components/GuessMap';
import ResultMap from '@/components/ResultMap';
import { AnimatedNumber, AccuracyLabel } from '@/components/AnimatedNumber';

type GameState = 'idle' | 'playing' | 'result' | 'finished';

interface RoundData {
  roundIndex: number;
  panoUrl: string;
}

interface GuessResult {
  distanceKm: number;
  score: number;
  correctLat: number;
  correctLng: number;
  totalScoreSoFar: number;
}

interface RoundResult extends GuessResult {
  roundIndex: number;
  guessLat: number;
  guessLng: number;
}

export default function PlayPage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
  const [roundIndex, setRoundIndex] = useState(1);
  const [guessLat, setGuessLat] = useState<number | null>(null);
  const [guessLng, setGuessLng] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se spustit hru');
      }

      const data = await response.json();
      setGameId(data.gameId);
      setCurrentRound(data.round);
      setRoundIndex(1);
      setGameState('playing');
      setRoundResults([]);
      setGuessLat(null);
      setGuessLng(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (lat: number, lng: number) => {
    setGuessLat(lat);
    setGuessLng(lng);
  };

  const handleSubmitGuess = async () => {
    if (!gameId || !currentRound || guessLat === null || guessLng === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/game/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          roundIndex: currentRound.roundIndex,
          guessLat,
          guessLng,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se odeslat tip');
      }

      const result: GuessResult = await response.json();

      const roundResult: RoundResult = {
        ...result,
        roundIndex: currentRound.roundIndex,
        guessLat,
        guessLng,
      };

      setRoundResults([...roundResults, roundResult]);
      setGameState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setLoading(false);
    }
  };

  const handleNextRound = async () => {
    if (roundIndex >= 5) {
      await handleFinishGame();
      return;
    }

    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/game/round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          roundIndex: roundIndex + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst další kolo');
      }

      const data = await response.json();
      setCurrentRound(data);
      setRoundIndex(roundIndex + 1);
      setGameState('playing');
      setGuessLat(null);
      setGuessLng(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishGame = async () => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/game/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId }),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se dokončit hru');
      }

      const data = await response.json();
      setFinalScore(data.totalScore);
      setGameState('finished');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = () => {
    setGameState('idle');
    setGameId(null);
    setCurrentRound(null);
    setRoundIndex(1);
    setGuessLat(null);
    setGuessLng(null);
    setRoundResults([]);
    setFinalScore(null);
  };

  const currentRoundResult = roundResults[roundResults.length - 1];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black pointer-events-none" />
      
      <div className="relative z-10 pt-20">
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-6 py-4 text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle State */}
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center px-4"
            >
              <div className="text-center space-y-8">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-7xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                >
                  DestiGuess
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-gray-400 max-w-md mx-auto"
                >
                  Hádejte lokace na základě 360° panoramatických obrázků
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartGame}
                  disabled={loading}
                  className="px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                >
                  {loading ? 'Spouštění...' : 'Začít hru'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === 'playing' && currentRound && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen"
            >
              {/* HUD Overlay */}
              <div className="fixed top-6 left-6 right-6 z-30 flex justify-between items-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-strong rounded-2xl px-6 py-4"
                >
                  <div className="text-sm text-gray-400 mb-1">Kolo</div>
                  <div className="text-3xl font-bold">
                    {roundIndex} <span className="text-gray-500">/ 5</span>
                  </div>
                </motion.div>
                
                {roundResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-strong rounded-2xl px-6 py-4"
                  >
                    <div className="text-sm text-gray-400 mb-1">Celkem</div>
                    <div className="text-3xl font-bold text-emerald-400">
                      <AnimatedNumber value={roundResults.reduce((sum, r) => sum + (r.score || 0), 0)} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Main Content */}
              <div className="pt-32 pb-8 px-4 lg:px-8">
                <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-6 lg:gap-8">
                  {/* Image - Full Height */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative rounded-3xl overflow-hidden bg-gray-900"
                    style={{ minHeight: 'calc(100vh - 200px)' }}
                  >
                    <img 
                      src={currentRound.panoUrl} 
                      alt="Hádejte lokaci" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Map Card - Floating */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="glass-strong rounded-3xl p-6 space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Umístěte svůj tip</h3>
                      <div className="rounded-2xl overflow-hidden bg-gray-900" style={{ height: '400px' }}>
                        <GuessMap mapKey={`guess-map-${roundIndex}-${currentRound.roundIndex}`} onGuess={handleGuess} disabled={loading} />
                      </div>
                      {guessLat !== null && guessLng !== null && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 text-sm text-gray-400"
                        >
                          {guessLat.toFixed(4)}, {guessLng.toFixed(4)}
                        </motion.div>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitGuess}
                      disabled={loading || guessLat === null || guessLng === null}
                      className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold text-lg rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none"
                    >
                      {loading ? 'Odesílání...' : 'Odeslat tip'}
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Result State */}
          {gameState === 'result' && currentRoundResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center px-4 py-20"
            >
              <div className="max-w-4xl w-full space-y-12">
                {/* Hero Numbers */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <div className="text-6xl lg:text-8xl font-bold">
                    <AnimatedNumber value={currentRoundResult.score} className="text-emerald-400" />
                  </div>
                  <AccuracyLabel distanceKm={currentRoundResult.distanceKm} />
                  <div className="text-2xl text-gray-400">
                    <AnimatedNumber value={currentRoundResult.distanceKm} decimals={2} /> km vzdálenost
                  </div>
                </motion.div>

                {/* Result Map */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-strong rounded-3xl p-6"
                >
                  <div className="rounded-2xl overflow-hidden bg-gray-900" style={{ height: '500px' }}>
                    <ResultMap
                      mapKey={`result-map-${roundIndex}-${currentRoundResult.roundIndex}`}
                      guessLat={currentRoundResult.guessLat}
                      guessLng={currentRoundResult.guessLng}
                      correctLat={currentRoundResult.correctLat}
                      correctLng={currentRoundResult.correctLng}
                    />
                  </div>
                </motion.div>

                {/* Total Score */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="text-sm text-gray-400 mb-2">Celkem bodů</div>
                  <div className="text-5xl font-bold text-emerald-400">
                    <AnimatedNumber value={currentRoundResult.totalScoreSoFar} />
                  </div>
                </motion.div>

                {/* Next Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextRound}
                    disabled={loading}
                    className="px-12 py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold text-lg rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none"
                  >
                    {loading
                      ? 'Načítání...'
                      : roundIndex >= 5
                      ? 'Zobrazit výsledky'
                      : 'Další kolo'}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Finished State */}
          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex items-center justify-center px-4 py-20"
            >
              <div className="max-w-4xl w-full space-y-12">
                {/* Final Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <h2 className="text-5xl lg:text-6xl font-bold">Hra dokončena</h2>
                  <div className="text-8xl lg:text-9xl font-bold text-emerald-400">
                    {finalScore !== null && <AnimatedNumber value={finalScore} />}
                  </div>
                  <p className="text-2xl text-gray-400">bodů celkem</p>
                </motion.div>

                {/* Rounds Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-strong rounded-3xl p-8 space-y-6"
                >
                  <h3 className="text-2xl font-semibold">Přehled kol</h3>
                  <div className="space-y-4">
                    {roundResults.map((result, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex justify-between items-center py-4 border-b border-white/10 last:border-b-0"
                      >
                        <div>
                          <div className="text-lg font-semibold">Kolo {result.roundIndex}</div>
                          <div className="text-sm text-gray-400">
                            {result.distanceKm.toFixed(2)} km
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-emerald-400">
                          {result.score}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Play Again Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayAgain}
                    className="px-12 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                  >
                    Hrát znovu
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
