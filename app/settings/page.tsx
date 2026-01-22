'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameSounds } from '@/components/GameAudio';
import { Music, Play, Pause, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

interface MusicTrack {
  name: string;
  filename: string;
  url: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
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
    // Načíst seznam hudby
    const loadTracks = async () => {
      try {
        const response = await fetch('/api/music/list');
        if (response.ok) {
          const data = await response.json();
          setTracks(data.tracks || []);
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    };
    loadTracks();

    // Načíst vybranou hudbu z localStorage
    const savedTrack = localStorage.getItem('destiguess-selected-music');
    if (savedTrack) {
      setSelectedTrack(savedTrack);
    } else if (tracks.length > 0) {
      // Defaultně první track
      setSelectedTrack(tracks[0].url);
    }
  }, []);

  useEffect(() => {
    // Aktualizovat vybranou hudbu v localStorage
    if (selectedTrack) {
      localStorage.setItem('destiguess-selected-music', selectedTrack);
      // Aktualizovat také v GameAudio komponentě přes window event
      window.dispatchEvent(new CustomEvent('music-changed', { detail: { url: selectedTrack } }));
    }
  }, [selectedTrack]);

  const handlePlayPreview = (trackUrl: string) => {
    playClick();
    
    // Zastavit předchozí preview
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }

    // Pokud je to stejný track, který už hraje, zastavit
    if (isPlaying && previewAudio?.src.endsWith(trackUrl)) {
      setIsPlaying(false);
      previewAudio.pause();
      return;
    }

    // Spustit nový preview
    const audio = new Audio(trackUrl);
    audio.volume = 0.3;
    audio.play().catch(() => {
      console.log('Preview play failed');
    });
    
    setPreviewAudio(audio);
    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
    };
  };

  const handleSelectTrack = (trackUrl: string) => {
    playClick();
    setSelectedTrack(trackUrl);
    
    // Zastavit preview pokud hraje
    if (previewAudio) {
      previewAudio.pause();
      setIsPlaying(false);
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
                <p className="text-sm text-gray-400 mt-1">Vyberte hudbu v pozadí</p>
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

          {/* Music Tracks List */}
          <div className="space-y-3">
            {tracks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Žádná hudba nenalezena</p>
                <p className="text-xs mt-2">Přidejte MP3 soubory do /public/music/</p>
              </div>
            ) : (
              tracks.map((track) => (
                <motion.div
                  key={track.url}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: tracks.indexOf(track) * 0.05 }}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    selectedTrack === track.url
                      ? 'bg-emerald-500/20 border-emerald-500/50'
                      : 'bg-gray-900/50 border-white/5 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handlePlayPreview(track.url)}
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center transition-colors"
                      >
                        {isPlaying && previewAudio?.src.endsWith(track.url) ? (
                          <Pause className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Play className="w-5 h-5 text-emerald-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base truncate">{track.name}</div>
                        <div className="text-xs text-gray-400 truncate">{track.filename}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectTrack(track.url)}
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
              ))
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-white/5">
            <p className="text-xs text-gray-400">
              Vybraná hudba se automaticky přehraje na celém webu. Hudba se loopuje a hraje nepřetržitě.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
