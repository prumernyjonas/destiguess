'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useFullscreenPlay } from '@/components/FullscreenPlayContext';

// ============================================
// NASTAVENÍ HUDBY V POZADÍ
// ============================================
// Hudba se načítá z localStorage (nastaveno uživatelem v /settings)
// Fallback na default hudbu, pokud není vybrána
// ============================================
const DEFAULT_MUSIC_URL = '/music/ambient.mp3'; // Default hudba

// Sdílený AudioContext pro všechny zvuky
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume pokud je suspended (kvůli autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Vylepšené, uklidňující zvuky pomocí Web Audio API - více vrstev, bohatší zvuk
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.12) {
  try {
    const ctx = getAudioContext();
    
    // Vytvořit více oscilátorů pro bohatší zvuk
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Hlavní oscilátor
    oscillator1.connect(gainNode);
    oscillator1.frequency.value = frequency;
    oscillator1.type = type;
    
    // Druhý oscilátor pro bohatší zvuk (harmonický)
    oscillator2.connect(gainNode);
    oscillator2.frequency.value = frequency * 1.5; // Oktáva a půl výš
    oscillator2.type = 'sine';
    
    gainNode.connect(ctx.destination);
    
    // Velmi jemný, smooth fade-in a fade-out pro uklidňující zvuk
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.03); // Delší fade-in
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator1.stop(now + duration);
    oscillator2.stop(now + duration);
  } catch (e) {
    // Ignorovat chyby
  }
}

// Speciální funkce pro klikací zvuk - více vrstev
function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Vytvořit více oscilátorů pro bohatší klikací zvuk
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    // Dva tóny pro příjemný klikací zvuk
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    osc1.type = 'sine';
    
    osc2.frequency.setValueAtTime(1000, now);
    osc2.frequency.exponentialRampToValueAtTime(800, now + 0.05);
    osc2.type = 'sine';
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.08);
    osc2.stop(now + 0.08);
  } catch (e) {
    // Ignorovat chyby
  }
}

// Speciální funkce pro place zvuk (kliknutí na mapu) - jemnější
function playPlaceSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    // Dva tóny pro příjemný place zvuk
    osc1.frequency.setValueAtTime(600, now);
    osc1.frequency.exponentialRampToValueAtTime(500, now + 0.1);
    osc1.type = 'sine';
    
    osc2.frequency.setValueAtTime(900, now);
    osc2.frequency.exponentialRampToValueAtTime(700, now + 0.1);
    osc2.type = 'sine';
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.12);
    osc2.stop(now + 0.12);
  } catch (e) {
    // Ignorovat chyby
  }
}

interface GameAudioContextValue {
  playPlace: () => void;
  playClick: () => void;
  playSubmit: () => void;
  playSwap: () => void;
  playResult: () => void;
  playSuccess: () => void;
  playError: () => void;
  playStart: () => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
}

const GameAudioContext = createContext<GameAudioContextValue | null>(null);

const STORAGE_KEY = 'destiguess-muted';

export function GameAudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false);
  const [musicUrl, setMusicUrl] = useState<string>(DEFAULT_MUSIC_URL);
  const { isFullscreenPlay } = useFullscreenPlay();
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      setMutedState(v === 'true');
      
      // Načíst vybranou hudbu z localStorage
      const savedMusic = localStorage.getItem('destiguess-selected-music');
      if (savedMusic) {
        setMusicUrl(savedMusic);
      }
    } catch {
      setMutedState(false);
    }
  }, []);

  // Poslouchat změny hudby z settings stránky
  useEffect(() => {
    const handleMusicChange = (e: CustomEvent) => {
      const newUrl = e.detail?.url;
      if (newUrl && newUrl !== musicUrl) {
        // Zastavit starou hudbu
        if (musicAudioRef.current) {
          musicAudioRef.current.pause();
          musicAudioRef.current = null;
        }
        setMusicUrl(newUrl);
      }
    };

    window.addEventListener('music-changed', handleMusicChange as EventListener);
    return () => {
      window.removeEventListener('music-changed', handleMusicChange as EventListener);
    };
  }, [musicUrl]);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
    try {
      localStorage.setItem(STORAGE_KEY, String(m));
    } catch {
      /**/
    }
    // Zastavit hudbu pokud je muted
    if (m && musicAudioRef.current) {
      musicAudioRef.current.pause();
    }
  }, []);

  // Vylepšené, uklidňující zvuky - více vrstev, bohatší zvuk
  const playPlace = useCallback(() => {
    if (!muted) {
      playPlaceSound();
    }
  }, [muted]);

  const playClick = useCallback(() => {
    if (!muted) {
      playClickSound();
    }
  }, [muted]);

  const playSubmit = useCallback(() => {
    if (!muted) {
      // Uklidňující dvoutónový zvuk s více vrstvami
      playTone(523, 0.14, 'sine', 0.08); // C
      setTimeout(() => playTone(659, 0.14, 'sine', 0.08), 100); // E - delší interval
    }
  }, [muted]);

  const playSwap = useCallback(() => {
    if (!muted) {
      // Smooth swap zvuk s více vrstvami
      playTone(440, 0.12, 'sine', 0.07);
      setTimeout(() => playTone(554, 0.12, 'sine', 0.07), 90);
    }
  }, [muted]);

  const playResult = useCallback(() => {
    if (!muted) {
      // Uklidňující vzestupný tón s více vrstvami
      playTone(440, 0.18, 'sine', 0.09); // A - nižší hlasitost
      setTimeout(() => playTone(554, 0.18, 'sine', 0.09), 150); // C# - delší interval
      setTimeout(() => playTone(659, 0.2, 'sine', 0.09), 300); // E
    }
  }, [muted]);

  const playSuccess = useCallback(() => {
    if (!muted) {
      // Uklidňující úspěšný zvuk - tři tóny (C-E-G major) s více vrstvami
      playTone(523, 0.14, 'sine', 0.08); // C
      setTimeout(() => playTone(659, 0.14, 'sine', 0.08), 160); // E
      setTimeout(() => playTone(784, 0.18, 'sine', 0.08), 320); // G
    }
  }, [muted]);

  const playError = useCallback(() => {
    if (!muted) {
      // Jemnější, uklidňující tón pro chybu s více vrstvami
      playTone(330, 0.2, 'sine', 0.07); // Nižší frekvence, delší trvání
    }
  }, [muted]);

  const playStart = useCallback(() => {
    if (!muted) {
      // Smooth start zvuk s více vrstvami
      playTone(440, 0.14, 'sine', 0.08);
      setTimeout(() => playTone(554, 0.16, 'sine', 0.08), 140);
    }
  }, [muted]);

  // Hudba v pozadí - hraje celou dobu na webu
  useEffect(() => {
    if (!musicUrl) return;

    // Zastavit a zničit starou hudbu pokud existuje a je jiná
    if (musicAudioRef.current) {
      const currentSrc = musicAudioRef.current.src;
      const newSrc = new URL(musicUrl, window.location.origin).href;
      
      if (currentSrc !== newSrc) {
        musicAudioRef.current.pause();
        musicAudioRef.current.src = '';
        musicAudioRef.current.load();
        musicAudioRef.current = null;
      }
    }

    // Vytvořit nový audio element pouze pokud neexistuje nebo je jiná hudba
    if (!musicAudioRef.current) {
      const audio = new Audio(musicUrl);
      audio.loop = true;
      audio.volume = muted ? 0 : 0.1;
      musicAudioRef.current = audio;

      // Spustit pokud není muted
      if (!muted) {
        audio.play().catch((error) => {
          // Ignorovat chyby autoplay (browser policy) - uživatel musí interagovat
          console.log('Autoplay prevented, user interaction required');
        });
      }
    } else {
      // Aktualizovat hlasitost existujícího audio
      musicAudioRef.current.volume = muted ? 0 : 0.1;
      
      // Spustit nebo pozastavit podle mute stavu
      if (!muted && musicAudioRef.current.paused) {
        musicAudioRef.current.play().catch(() => {
          console.log('Play prevented');
        });
      } else if (muted && !musicAudioRef.current.paused) {
        musicAudioRef.current.pause();
      }
    }
    
    return () => {
      // NIKDY nezastavovat hudbu - jen při unmount komponenty
      // Hudba bude pokračovat i při změně stránky
    };
  }, [muted, musicUrl]);

  const value: GameAudioContextValue = {
    playPlace,
    playClick,
    playSubmit,
    playSwap,
    playResult,
    playSuccess,
    playError,
    playStart,
    muted,
    setMuted,
  };

  return (
    <GameAudioContext.Provider value={value}>
      {children}
    </GameAudioContext.Provider>
  );
}

export function useGameSounds() {
  const ctx = useContext(GameAudioContext);
  return ctx ?? {
    playPlace: () => {},
    playClick: () => {},
    playSubmit: () => {},
    playSwap: () => {},
    playResult: () => {},
    playSuccess: () => {},
    playError: () => {},
    playStart: () => {},
    muted: false,
    setMuted: () => {},
  };
}
