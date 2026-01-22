'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameSounds } from '@/components/GameAudio';
import { Music, ArrowLeft, Volume2, VolumeX, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface YouTubeTrack {
  id: string;
  title: string;
  channel: string;
  thumbnail?: string;
  url: string;
  embedUrl: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [musicVolume, setMusicVolume] = useState<number>(0.1);
  
  // YouTube search
  const [searchQuery, setSearchQuery] = useState('');
  const [youtubeTracks, setYoutubeTracks] = useState<YouTubeTrack[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Current playing track info
  const [currentTrackInfo, setCurrentTrackInfo] = useState<{
    title: string;
    thumbnail?: string;
    channel?: string;
    id?: string;
  } | null>(null);
  
  // Timeline
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();
  const { playClick, muted, setMuted } = useGameSounds();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    loadUser();
  }, [router, supabase]);

  useEffect(() => {
    // Načíst vybranou hudbu z localStorage
    const savedTrack = localStorage.getItem('destiguess-selected-music');
    const savedVolume = localStorage.getItem('destiguess-music-volume');
    
    if (savedTrack) {
      setSelectedTrack(savedTrack);
      
      // Zkusit najít v localStorage info o tracku
      const savedTrackInfo = localStorage.getItem('destiguess-current-track-info');
      if (savedTrackInfo) {
        try {
          const info = JSON.parse(savedTrackInfo);
          setCurrentTrackInfo(info);
          
          // Automaticky vyhledat a zobrazit v seznamu
          const searchTerm = info.title || '';
          if (searchTerm) {
            // Nastavit vyhledávací dotaz
            setSearchQuery(searchTerm);
            
            // Vyhledat asynchronně
            fetch(`/api/music/youtube?q=${encodeURIComponent(searchTerm)}`)
              .then(res => res.json())
              .then(data => {
                if (data.tracks && data.tracks.length > 0) {
                  setYoutubeTracks(data.tracks);
                  
                  // Najít aktuální track v seznamu
                  const currentTrack = data.tracks.find((t: YouTubeTrack) => 
                    t.url === savedTrack || t.id === info.id
                  );
                  
                  if (currentTrack) {
                    setCurrentTrackInfo({
                      title: currentTrack.title,
                      thumbnail: currentTrack.thumbnail,
                      channel: currentTrack.channel,
                      id: currentTrack.id,
                    });
                    localStorage.setItem('destiguess-current-track-info', JSON.stringify({
                      title: currentTrack.title,
                      thumbnail: currentTrack.thumbnail,
                      channel: currentTrack.channel,
                      id: currentTrack.id,
                    }));
                  }
                }
              })
              .catch(error => {
                console.error('Error auto-searching YouTube:', error);
              });
          }
        } catch (e) {
          console.log('Error parsing track info:', e);
        }
      }
    } else {
      // Pokud není vybraná hudba, načíst náhodná doporučení
      loadRandomRecommendations();
    }

    // Načíst hlasitost hudby z localStorage
    if (savedVolume) {
      const volume = parseFloat(savedVolume);
      if (!isNaN(volume) && volume >= 0 && volume <= 1) {
        setMusicVolume(volume);
      }
    }
  }, []);

  // Aktualizovat currentTrackInfo když se změní selectedTrack
  useEffect(() => {
    if (!selectedTrack) return;
    
    // Pro YouTube - zkusit najít v youtubeTracks
    const track = youtubeTracks.find(t => t.url === selectedTrack);
    if (track) {
      const info = {
        title: track.title,
        thumbnail: track.thumbnail,
        channel: track.channel,
        id: track.id,
      };
      setCurrentTrackInfo(info);
      localStorage.setItem('destiguess-current-track-info', JSON.stringify(info));
    }
  }, [selectedTrack, youtubeTracks]);

  // Timeline update interval - pouze pro YouTube
  useEffect(() => {
    if (!currentTrackInfo) return;
    
    const interval = setInterval(() => {
      if (isSeeking) return;
      
      try {
        const playerElement = document.getElementById('youtube-music-player');
        if (playerElement && (window as any).YT) {
          let player: any = null;
          
          if ((window as any).YT.Player && (window as any).YT.Player.getInstanceById) {
            try {
              player = (window as any).YT.Player.getInstanceById('youtube-music-player');
            } catch (e) {
              // Ignorovat
            }
          }
          
          if (!player && (playerElement as any).player) {
            player = (playerElement as any).player;
          }
          
          if (player) {
            try {
              const current = player.getCurrentTime();
              const total = player.getDuration();
              if (typeof current === 'number' && !isNaN(current) && current >= 0) {
                setCurrentTime(current);
              }
              if (typeof total === 'number' && !isNaN(total) && total > 0) {
                setDuration(total);
              }
            } catch (e) {
              // Ignorovat chyby při získávání času
            }
          }
        }
      } catch (e) {
        // Ignorovat chyby
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentTrackInfo, isSeeking]);

  useEffect(() => {
    // Aktualizovat vybranou hudbu v localStorage
    if (selectedTrack) {
      localStorage.setItem('destiguess-selected-music', selectedTrack);
      window.dispatchEvent(new CustomEvent('music-changed', { detail: { url: selectedTrack } }));
    }
  }, [selectedTrack]);

  useEffect(() => {
    // Aktualizovat hlasitost hudby v localStorage a GameAudio komponentě
    localStorage.setItem('destiguess-music-volume', String(musicVolume));
    window.dispatchEvent(new CustomEvent('music-volume-changed', { detail: { volume: musicVolume } }));
  }, [musicVolume]);

  const handleSearchYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    playClick();

    try {
      const response = await fetch(`/api/music/youtube?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.error && !data.tracks) {
        console.error('Search error:', data.error);
        setYoutubeTracks([]);
      } else {
        setYoutubeTracks(data.tracks || []);
      }
    } catch (error) {
      console.error('Error searching YouTube:', error);
      setYoutubeTracks([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectYouTubeTrack = (track: YouTubeTrack) => {
    playClick();
    setSelectedTrack(track.url);
    
    // Uložit info o tracku
    const info = {
      title: track.title,
      thumbnail: track.thumbnail,
      channel: track.channel,
      id: track.id,
    };
    setCurrentTrackInfo(info);
    localStorage.setItem('destiguess-current-track-info', JSON.stringify(info));
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    setIsSeeking(true);
    setCurrentTime(newTime);
    
    try {
      const playerElement = document.getElementById('youtube-music-player');
      if (playerElement && (window as any).YT) {
        let player: any = null;
        
        if ((window as any).YT.Player && (window as any).YT.Player.getInstanceById) {
          try {
            player = (window as any).YT.Player.getInstanceById('youtube-music-player');
          } catch (e) {
            // Ignorovat
          }
        }
        
        if (!player && (playerElement as any).player) {
          player = (playerElement as any).player;
        }
        
        if (player) {
          player.seekTo(newTime, true);
        }
      }
    } catch (e) {
      console.log('Error seeking YouTube:', e);
    }
    
    setTimeout(() => setIsSeeking(false), 100);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
  };

  const handleNextTrack = () => {
    if (youtubeTracks.length === 0) return;
    
    const currentIndex = youtubeTracks.findIndex(t => t.url === selectedTrack);
    if (currentIndex === -1) {
      // Pokud aktuální track není v seznamu, vybrat první
      if (youtubeTracks.length > 0) {
        handleSelectYouTubeTrack(youtubeTracks[0]);
      }
    } else {
      // Vybrat další track (cyklicky)
      const nextIndex = (currentIndex + 1) % youtubeTracks.length;
      handleSelectYouTubeTrack(youtubeTracks[nextIndex]);
    }
    playClick();
  };

  const handlePreviousTrack = () => {
    if (youtubeTracks.length === 0) return;
    
    const currentIndex = youtubeTracks.findIndex(t => t.url === selectedTrack);
    if (currentIndex === -1) {
      // Pokud aktuální track není v seznamu, vybrat poslední
      if (youtubeTracks.length > 0) {
        handleSelectYouTubeTrack(youtubeTracks[youtubeTracks.length - 1]);
      }
    } else {
      // Vybrat předchozí track (cyklicky)
      const prevIndex = (currentIndex - 1 + youtubeTracks.length) % youtubeTracks.length;
      handleSelectYouTubeTrack(youtubeTracks[prevIndex]);
    }
    playClick();
  };

  const loadRandomRecommendations = async () => {
    // Náhodné doporučené skladby - populární hudba
    const randomQueries = [
      'lofi hip hop',
      'chill music',
      'ambient music',
      'study music',
      'relaxing music',
      'jazz music',
      'classical music',
      'electronic music',
    ];
    
    const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)];
    setSearchQuery(randomQuery);
    
    try {
      const response = await fetch(`/api/music/youtube?q=${encodeURIComponent(randomQuery)}`);
      const data = await response.json();
      
      if (data.tracks && data.tracks.length > 0) {
        setYoutubeTracks(data.tracks);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="glass-strong rounded-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { playClick(); router.back(); }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Music className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
                  Nastavení hudby
                </h1>
                <p className="text-sm text-gray-400 mt-1">Vyberte hudbu z YouTube</p>
              </div>
            </div>
            <button
              onClick={() => { playClick(); setMuted(!muted); }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={muted ? 'Zapnout zvuk' : 'Vypnout zvuk'}
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-gray-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          </div>

          {/* Currently Playing */}
          {currentTrackInfo && (
            <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-4 mb-4">
                {currentTrackInfo.thumbnail && (
                  <img
                    src={currentTrackInfo.thumbnail}
                    alt={currentTrackInfo.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">{currentTrackInfo.title}</div>
                  {currentTrackInfo.channel && (
                    <div className="text-xs text-gray-400 truncate">{currentTrackInfo.channel}</div>
                  )}
                  <div className="text-xs text-emerald-400 mt-1">YouTube</div>
                </div>
                {/* Navigation arrows */}
                {youtubeTracks.length > 1 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreviousTrack}
                      className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                      aria-label="Předchozí skladba"
                    >
                      <ChevronLeft className="w-5 h-5 text-emerald-400" />
                    </button>
                    <button
                      onClick={handleNextTrack}
                      className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                      aria-label="Další skladba"
                    >
                      <ChevronRight className="w-5 h-5 text-emerald-400" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Timeline */}
              {duration > 0 && (
                <div className="space-y-2">
                  <div
                    onClick={handleTimelineClick}
                    className="w-full h-2 bg-gray-800 rounded-full cursor-pointer relative group"
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Volume Control */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Hlasitost hudby
              </label>
              <span className="text-sm text-gray-400">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${musicVolume * 100}%, #1f2937 ${musicVolume * 100}%, #1f2937 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* YouTube Search */}
          <div className="space-y-4">
            <form onSubmit={handleSearchYouTube} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hledat hudbu na YouTube..."
                  className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-white/10 rounded-lg focus:border-emerald-500/50 focus:outline-none text-white placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setYoutubeTracks([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {searching ? 'Hledám...' : 'Hledat'}
              </button>
            </form>

            {/* YouTube Results */}
            {youtubeTracks.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {youtubeTracks.map((track) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      selectedTrack === track.url
                        ? 'bg-emerald-500/20 border-emerald-500/50'
                        : 'bg-gray-900/50 border-white/5 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {track.thumbnail && (
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base truncate">{track.title}</div>
                        <div className="text-xs text-gray-400 truncate">{track.channel}</div>
                      </div>
                      <button
                        onClick={() => handleSelectYouTubeTrack(track)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                          selectedTrack === track.url
                            ? 'bg-emerald-500 text-black'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {selectedTrack === track.url ? 'Vybraná' : 'Vybrat'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {youtubeTracks.length === 0 && searchQuery && !searching && (
              <div className="text-center py-8 text-gray-400">
                <p>Žádné výsledky nenalezeny</p>
                <p className="text-xs mt-2">Zkuste jiný vyhledávací dotaz</p>
              </div>
            )}

            {!searchQuery && youtubeTracks.length === 0 && !currentTrackInfo && (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Vyhledejte hudbu na YouTube</p>
                <p className="text-xs mt-2">Zadejte název skladby nebo interpreta</p>
                <button
                  onClick={() => { playClick(); loadRandomRecommendations(); }}
                  className="mt-4 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors text-sm font-semibold"
                >
                  Načíst doporučené
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-white/5">
            <p className="text-xs text-gray-400">
              Pro použití YouTube hudby potřebujete nastavit NEXT_PUBLIC_YOUTUBE_API_KEY v .env.local. Hudba se přehraje přes YouTube player.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
