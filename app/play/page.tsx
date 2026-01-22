'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, Play, CheckCircle, XCircle, RotateCcw, Maximize2, Map } from 'lucide-react';
import GuessMap from '@/components/GuessMap';
import ResultMap from '@/components/ResultMap';
import { AnimatedNumber, AccuracyLabel } from '@/components/AnimatedNumber';
import { useFullscreenPlay } from '@/components/FullscreenPlayContext';
import { useGameSounds } from '@/components/GameAudio';

type GameState = 'idle' | 'playing' | 'result' | 'finished';

interface RoundData {
  roundIndex: number;
  imageUrl: string;
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
  const [mainView, setMainView] = useState<'map' | 'image'>('map');
  const { setFullscreenPlay } = useFullscreenPlay();
  const { playStart, playPlace, playResult, playClick, playSubmit, playSwap, playError, playSuccess } = useGameSounds();

  useEffect(() => {
    setFullscreenPlay(gameState === 'playing');
    return () => setFullscreenPlay(false);
  }, [gameState, setFullscreenPlay]);

  const handleStartGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Nepodařilo se spustit hru');
      }

      setGameId(data.gameId);
      setCurrentRound(data.round);
      setRoundIndex(1);
      setGameState('playing');
      setRoundResults([]);
      setGuessLat(null);
      setGuessLng(null);
      setMainView('map');
      playStart();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nastala chyba';
      setError(errorMessage);
      playError();
      console.error('Error starting game:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuess = (lat: number, lng: number) => {
    playPlace();
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
      playResult();
      playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
      playError();
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
      setMainView('map');
      playStart();
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

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Nepodařilo se dokončit hru');
      }

      // Zpracovat výsledky kol z API odpovědi
      if (data.rounds && Array.isArray(data.rounds)) {
        const processedRounds: RoundResult[] = data.rounds.map((round: any) => ({
          roundIndex: round.roundIndex,
          guessLat: round.guessLat,
          guessLng: round.guessLng,
          correctLat: round.correctLat,
          correctLng: round.correctLng,
          distanceKm: round.distanceKm || 0,
          score: round.score || 0,
        }));
        setRoundResults(processedRounds);
      }

      setFinalScore(data.totalScore);
      setGameState('finished');
      playResult();
      playSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba');
      playError();
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
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Enhanced gradient background with animated particles */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 via-emerald-950/20 to-black pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 pt-24 pb-0">
        {/* Error message - improved styling */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] glass-strong rounded-2xl px-6 py-4 text-red-400 max-w-md mx-4 shadow-2xl shadow-red-500/20 border border-red-500/30"
            >
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle State - Enhanced */}
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 sm:px-6 py-12"
            >
              <div className="text-center space-y-8 sm:space-y-10 max-w-3xl w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, type: "spring", damping: 20 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <motion.h1 
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    DestiGuess
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg sm:text-xl md:text-2xl text-gray-300 font-light leading-relaxed px-4"
                  >
                    Hádejte lokace na základě obrázků známých míst
                  </motion.p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", damping: 15 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { playClick(); handleStartGame(); }}
                    disabled={loading}
                    className="group relative inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-base sm:text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    />
                    <Play className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                          />
                          Spouštění...
                        </span>
                      ) : (
                        'Začít hru'
                      )}
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Playing State - fullscreen, prohazování mapy a obrázku */}
          {gameState === 'playing' && currentRound && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-0"
            >
              {/* HUD - kolo + skóre vpravo nahoře */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="fixed top-28 right-3 sm:right-4 z-40 flex items-center gap-2 glass-strong rounded-lg sm:rounded-xl px-3 py-2 backdrop-blur-xl border border-white/10 shadow-xl pointer-events-auto"
              >
                <span className="text-xs text-gray-400 whitespace-nowrap">Kolo</span>
                <span className="text-sm sm:text-base font-bold">{roundIndex}/5</span>
                {roundResults.length > 0 && (
                  <>
                    <span className="text-gray-600">|</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">Celkem</span>
                    <span className="text-sm sm:text-base font-bold text-emerald-400">
                      <AnimatedNumber value={roundResults.reduce((sum, r) => sum + (r.score || 0), 0)} />
                    </span>
                  </>
                )}
              </motion.div>

              {/* Velký výřez: mapa NEBO obrázek (prohození podle mainView) */}
              {mainView === 'map' && (
                <div className="fixed top-24 left-0 right-0 bottom-0 z-10">
                  <GuessMap mapKey={`guess-map-${roundIndex}-${currentRound.roundIndex}`} onGuess={handleGuess} disabled={loading} />
                </div>
              )}
              {mainView === 'image' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed top-24 left-0 right-0 bottom-0 z-10 bg-black flex items-center justify-center p-4"
                >
                  <img
                    src={currentRound.imageUrl}
                    alt="Hádejte lokaci"
                    className="max-w-full max-h-full object-contain rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop';
                    }}
                  />
                  <button
                    onClick={() => { playSwap(); setMainView('map'); }}
                    className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/70 hover:bg-emerald-500/80 backdrop-blur-sm transition-colors"
                    aria-label="Zobrazit mapu"
                  >
                    <Map className="w-5 h-5 text-white" />
                  </button>
                </motion.div>
              )}

              {/* Malý výřez vlevo nahoře: obrázek NEBO mapa (druhý se zobrazí malý, klik = prohodit) */}
              {mainView === 'map' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.5, type: "spring", damping: 20 }}
                  className="fixed top-28 left-2 sm:left-4 z-40 w-[calc(100vw-1rem)] sm:w-64 md:w-72 lg:w-80 max-w-sm rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-white/10 cursor-pointer group hover:border-emerald-500/50 transition-all duration-300"
                  onClick={() => { playSwap(); setMainView('image'); }}
                >
                  <div className="relative">
                    <img
                      src={currentRound.imageUrl}
                      alt="Hádejte lokaci"
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-lg p-2 group-hover:bg-emerald-500/80 transition-colors">
                      <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>
                </motion.div>
              )}
              {mainView === 'image' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.5, type: "spring", damping: 20 }}
                  className="fixed top-28 left-2 sm:left-4 z-40 w-[calc(100vw-1rem)] sm:w-64 md:w-72 lg:w-80 max-w-sm rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-white/10 group hover:border-emerald-500/50 transition-all duration-300 h-44 sm:h-48"
                >
                  <div className="relative w-full h-full">
                    <GuessMap mapKey={`guess-map-small-${roundIndex}-${currentRound.roundIndex}`} onGuess={handleGuess} disabled={loading} />
                    <button
                      type="button"
                      onClick={() => { playSwap(); setMainView('map'); }}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-lg p-2 hover:bg-emerald-500/80 transition-colors"
                      aria-label="Zvětšit mapu"
                    >
                      <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Controls Overlay - dole vpravo */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="fixed bottom-4 sm:bottom-6 right-2 sm:right-4 md:right-6 left-2 sm:left-auto z-40 glass-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4 backdrop-blur-xl border border-white/10 shadow-2xl w-auto sm:min-w-[280px] md:min-w-[300px] max-w-[calc(100vw-1rem)] sm:max-w-none"
              >
                {guessLat !== null && guessLng !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="p-3 bg-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-500/20"
                  >
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Vybrané souřadnice
                    </div>
                    <div className="text-xs sm:text-sm font-mono text-emerald-400 break-all">
                      {guessLat.toFixed(4)}, {guessLng.toFixed(4)}
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playSubmit(); handleSubmitGuess(); }}
                  disabled={loading || guessLat === null || guessLng === null}
                  className="group w-full py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold text-base sm:text-lg rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                        />
                        Odesílání...
                      </span>
                    ) : (
                      'Odeslat tip'
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Result State – vše nahoře, bez scrollování */}
          {gameState === 'result' && currentRoundResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-5rem)] flex flex-col px-3 sm:px-4 pt-2 pb-3 sm:pt-3 sm:pb-4"
            >
              {/* Řádek 1: skóre kola | přesnost | km | celkem – kompaktní */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-2 sm:mb-3"
              >
                <span className="text-2xl sm:text-3xl font-bold text-emerald-400">
                  <AnimatedNumber value={currentRoundResult.score} />
                </span>
                <AccuracyLabel distanceKm={currentRoundResult.distanceKm} />
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <AnimatedNumber value={currentRoundResult.distanceKm} decimals={2} /> km
                </span>
                <span className="text-sm text-gray-400">
                  Celkem <span className="font-bold text-emerald-400"><AnimatedNumber value={currentRoundResult.totalScoreSoFar} /></span>
                </span>
              </motion.div>

              {/* Mapa – bere zbývající místo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 20 }}
                className="flex-1 min-h-0 glass-strong rounded-xl sm:rounded-2xl p-2 sm:p-3 backdrop-blur-xl border border-white/10"
              >
                <div className="w-full h-full min-h-[200px] rounded-lg overflow-hidden bg-gray-900 border border-white/10">
                  <ResultMap
                    mapKey={`result-map-${roundIndex}-${currentRoundResult.roundIndex}`}
                    guessLat={currentRoundResult.guessLat}
                    guessLng={currentRoundResult.guessLng}
                    correctLat={currentRoundResult.correctLat}
                    correctLng={currentRoundResult.correctLng}
                  />
                </div>
              </motion.div>

              {/* Tlačítko Další / Zobrazit výsledky */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mt-2 sm:mt-3 shrink-0"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playClick(); handleNextRound(); }}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                      />
                      Načítání...
                    </>
                  ) : roundIndex >= 5 ? (
                    <>
                      <Trophy className="w-4 h-4" />
                      Zobrazit výsledky
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Další kolo
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* Finished State - Compact Layout */}
          {gameState === 'finished' && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100vh-6rem)] flex items-center justify-center px-4 sm:px-6 py-4"
            >
              <div className="max-w-6xl w-full h-full flex flex-col">
                {/* Header with Score - Compact */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="text-center mb-4"
                >
                  <motion.h2 
                    className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                    Hra dokončena
                  </motion.h2>
                  <motion.div 
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-emerald-400 mb-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.2 }}
                  >
                    {finalScore !== null && <AnimatedNumber value={finalScore} />}
                  </motion.div>
                  <motion.p 
                    className="text-sm sm:text-base text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    bodů celkem
                  </motion.p>
                </motion.div>

                {/* Rounds Summary - Grid Layout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", damping: 20 }}
                  className="glass-strong rounded-xl p-3 sm:p-4 flex-1 min-h-0 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                >
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-3 flex-shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                    Přehled kol
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 overflow-y-auto flex-1">
                    {roundResults.map((result, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05, type: "spring", damping: 20 }}
                        className="flex flex-col justify-between p-3 rounded-lg bg-gray-900/50 border border-white/5 hover:bg-gray-900/70 hover:border-emerald-500/30 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs transition-colors">
                            {result.roundIndex}
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-emerald-400 flex items-center gap-1">
                            <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                            {result.score}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {result.distanceKm.toFixed(1)} km
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Play Again Button - Compact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring", damping: 20 }}
                  className="text-center mt-4 flex-shrink-0"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { playClick(); handlePlayAgain(); }}
                    className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm sm:text-base rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    />
                    <RotateCcw className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Hrát znovu</span>
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
