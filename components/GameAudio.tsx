'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useFullscreenPlay } from '@/components/FullscreenPlayContext';

// ============================================
// NASTAVENÍ HUDBY V POZADÍ
// ============================================
// Hudba se načítá z localStorage (nastaveno uživatelem v /settings)
// Fallback na default hudbu, pokud není vybrána
// ============================================
const DEFAULT_MUSIC_URL = ''; // Žádná default hudba - pouze YouTube

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

// Uklidňující, smooth zvuky pomocí Web Audio API - bez šumu, velmi jemné
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.12) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    // Velmi jemný, smooth fade-in a fade-out pro uklidňující zvuk
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.02); // Delší fade-in pro smooth efekt
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
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

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url);
}

export function GameAudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMutedState] = useState(false);
  const [musicUrl, setMusicUrl] = useState<string>(DEFAULT_MUSIC_URL);
  const [musicVolume, setMusicVolume] = useState<number>(0.1);
  const { isFullscreenPlay } = useFullscreenPlay();
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null);
  const youtubeApiLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      setMutedState(v === 'true');
      
      // Načíst vybranou hudbu z localStorage
      const savedMusic = localStorage.getItem('destiguess-selected-music');
      if (savedMusic) {
        setMusicUrl(savedMusic);
      }

      // Načíst hlasitost hudby z localStorage
      const savedVolume = localStorage.getItem('destiguess-music-volume');
      if (savedVolume) {
        const volume = parseFloat(savedVolume);
        if (!isNaN(volume) && volume >= 0 && volume <= 1) {
          setMusicVolume(volume);
        }
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
        // Zastavit starou hudbu (YouTube i audio)
        if (musicAudioRef.current) {
          musicAudioRef.current.pause();
          musicAudioRef.current = null;
        }
        if (youtubePlayerRef.current) {
          try {
            youtubePlayerRef.current.destroy();
          } catch (e) {
            console.log('Error destroying YouTube player:', e);
          }
          youtubePlayerRef.current = null;
        }
        setMusicUrl(newUrl);
      }
    };

    const handleVolumeChange = (e: CustomEvent) => {
      const newVolume = e.detail?.volume;
      if (newVolume !== undefined && newVolume !== musicVolume) {
        setMusicVolume(newVolume);
      }
    };

    window.addEventListener('music-changed', handleMusicChange as EventListener);
    window.addEventListener('music-volume-changed', handleVolumeChange as EventListener);
    return () => {
      window.removeEventListener('music-changed', handleMusicChange as EventListener);
      window.removeEventListener('music-volume-changed', handleVolumeChange as EventListener);
    };
  }, [musicUrl, musicVolume]);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
    try {
      localStorage.setItem(STORAGE_KEY, String(m));
    } catch {
      /**/
    }
    // Zastavit hudbu pokud je muted (YouTube i audio)
    if (m) {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
      }
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.pauseVideo();
        } catch (e) {
          console.log('Error pausing YouTube player:', e);
        }
      }
    }
  }, []);

  // Uklidňující, velmi jemné zvuky - nízká hlasitost
  const playPlace = useCallback(() => {
    if (!muted) {
      // Jemný, uklidňující tón pro kliknutí na mapu
      playTone(523, 0.1, 'sine', 0.05); // C nota - velmi nízká hlasitost
    }
  }, [muted]);

  const playClick = useCallback(() => {
    if (!muted) {
      // Velmi jemný, uklidňující klikací zvuk
      playTone(440, 0.12, 'sine', 0.04); // A nota - velmi nízká hlasitost
    }
  }, [muted]);

  const playSubmit = useCallback(() => {
    if (!muted) {
      // Uklidňující dvoutónový zvuk
      playTone(523, 0.12, 'sine', 0.05); // C - velmi nízká hlasitost
      setTimeout(() => playTone(659, 0.12, 'sine', 0.05), 80); // E - delší interval
    }
  }, [muted]);

  const playSwap = useCallback(() => {
    if (!muted) {
      // Smooth swap zvuk
      playTone(440, 0.1, 'sine', 0.04);
      setTimeout(() => playTone(554, 0.1, 'sine', 0.04), 70);
    }
  }, [muted]);

  const playResult = useCallback(() => {
    if (!muted) {
      // Uklidňující vzestupný tón
      playTone(440, 0.15, 'sine', 0.06); // A - nízká hlasitost
      setTimeout(() => playTone(554, 0.15, 'sine', 0.06), 120); // C# - delší interval
      setTimeout(() => playTone(659, 0.18, 'sine', 0.06), 240); // E
    }
  }, [muted]);

  const playSuccess = useCallback(() => {
    if (!muted) {
      // Uklidňující úspěšný zvuk - tři tóny (C-E-G major)
      playTone(523, 0.12, 'sine', 0.05); // C
      setTimeout(() => playTone(659, 0.12, 'sine', 0.05), 140); // E
      setTimeout(() => playTone(784, 0.16, 'sine', 0.05), 280); // G
    }
  }, [muted]);

  const playError = useCallback(() => {
    if (!muted) {
      // Jemnější, uklidňující tón pro chybu
      playTone(330, 0.18, 'sine', 0.04); // Nižší frekvence, delší trvání, velmi nízká hlasitost
    }
  }, [muted]);

  const playStart = useCallback(() => {
    if (!muted) {
      // Smooth start zvuk
      playTone(440, 0.12, 'sine', 0.05);
      setTimeout(() => playTone(554, 0.14, 'sine', 0.05), 120);
    }
  }, [muted]);

  // Načíst YouTube IFrame API
  useEffect(() => {
    if (youtubeApiLoadedRef.current) return;

    // Zkontrolovat, zda už není načteno
    if (window.YT && window.YT.Player) {
      youtubeApiLoadedRef.current = true;
      return;
    }

    // Vytvořit container pro YouTube player (skrytý)
    if (!youtubeContainerRef.current) {
      const container = document.createElement('div');
      container.id = 'youtube-music-player';
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
      youtubeContainerRef.current = container;
    }

    // Načíst YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Callback když je API připraveno
    window.onYouTubeIframeAPIReady = () => {
      youtubeApiLoadedRef.current = true;
    };

    return () => {
      // Cleanup při unmount
      if (youtubeContainerRef.current && youtubeContainerRef.current.parentNode) {
        youtubeContainerRef.current.parentNode.removeChild(youtubeContainerRef.current);
      }
    };
  }, []);

  // Hudba v pozadí - pouze YouTube
  useEffect(() => {
    if (!musicUrl) return;

    const isYouTube = isYouTubeUrl(musicUrl);
    const videoId = isYouTube ? extractYouTubeVideoId(musicUrl) : null;

    if (!isYouTube || !videoId) {
      // Pokud není YouTube URL, zastavit vše
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {
          console.log('Error destroying YouTube player:', e);
        }
        youtubePlayerRef.current = null;
      }
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
      return;
    }

    // YouTube hudba - inicializace pouze pokud ještě není vytvořen player nebo se změnila URL
    const initYouTubePlayer = () => {
      if (!youtubeApiLoadedRef.current || !window.YT || !window.YT.Player) {
        // Čekat na načtení API
        setTimeout(initYouTubePlayer, 100);
        return;
      }

      // Pokud už existuje player se stejným videem, neinicializovat znovu
      if (youtubePlayerRef.current) {
        try {
          const currentVideoId = youtubePlayerRef.current.getVideoData()?.video_id;
          if (currentVideoId === videoId) {
            // Stejné video, pouze aktualizovat hlasitost a mute stav
            youtubePlayerRef.current.setVolume(muted ? 0 : Math.round(musicVolume * 100));
            if (muted) {
              youtubePlayerRef.current.pauseVideo();
            } else {
              // Zkontrolovat stav a spustit pouze pokud není paused nebo ended
              const playerState = youtubePlayerRef.current.getPlayerState();
              if (playerState === window.YT.PlayerState.PAUSED || playerState === window.YT.PlayerState.ENDED) {
                youtubePlayerRef.current.playVideo();
              }
            }
            return;
          }
          // Jiné video - zničit starý player
          youtubePlayerRef.current.destroy();
        } catch (e) {
          console.log('Error checking YouTube player:', e);
        }
        youtubePlayerRef.current = null;
      }

      // Vytvořit container pokud neexistuje
      if (!youtubeContainerRef.current) {
        const container = document.createElement('div');
        container.id = 'youtube-music-player';
        container.style.position = 'fixed';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);
        youtubeContainerRef.current = container;
      }

      // Vytvořit nový YouTube player
      try {
        youtubePlayerRef.current = new window.YT.Player('youtube-music-player', {
          videoId: videoId,
          playerVars: {
            autoplay: muted ? 0 : 1,
            loop: 1,
            playlist: videoId, // Pro loopování
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
          },
          events: {
            onReady: (event: any) => {
              // Nastavit hlasitost
              event.target.setVolume(muted ? 0 : Math.round(musicVolume * 100));
              // Spustit pokud není muted
              if (!muted) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              // Loopování - když video skončí, znovu spustit
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            },
          },
        });
      } catch (e) {
        console.error('Error creating YouTube player:', e);
      }
    };

    initYouTubePlayer();
    
    return () => {
      // NIKDY nezastavovat hudbu - jen při unmount komponenty
      // Hudba bude pokračovat i při změně stránky
    };
  }, [muted, musicUrl]); // Odstraněno musicVolume - pro YouTube se aktualizuje v samostatném useEffect

  // Aktualizovat hlasitost YouTube playeru (bez re-inicializace)
  useEffect(() => {
    if (youtubePlayerRef.current && isYouTubeUrl(musicUrl)) {
      try {
        // Pouze aktualizovat hlasitost, ne spouštět video znovu
        youtubePlayerRef.current.setVolume(muted ? 0 : Math.round(musicVolume * 100));
        
        // Spravovat pause/play pouze podle mute stavu
        if (muted) {
          const playerState = youtubePlayerRef.current.getPlayerState();
          if (playerState === window.YT.PlayerState.PLAYING) {
            youtubePlayerRef.current.pauseVideo();
          }
        } else {
          // Pokud není muted, zkontrolovat stav a spustit pouze pokud je paused nebo ended
          const playerState = youtubePlayerRef.current.getPlayerState();
          if (playerState === window.YT.PlayerState.PAUSED || playerState === window.YT.PlayerState.ENDED) {
            youtubePlayerRef.current.playVideo();
          }
          // Pokud už hraje, nechat hrát - pouze změnit hlasitost
        }
      } catch (e) {
        console.log('Error updating YouTube player volume:', e);
      }
    }
  }, [muted, musicVolume, musicUrl]);

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
