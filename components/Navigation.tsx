'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogIn, MapPin, Home, Volume2, VolumeX, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFullscreenPlay } from '@/components/FullscreenPlayContext';
import { useGameSounds } from '@/components/GameAudio';

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();
  const { isFullscreenPlay } = useFullscreenPlay();
  const { muted, setMuted, playClick } = useGameSounds();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      }
    };
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetch('/api/user/profile').then(r => r.json()).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (pathname === '/auth') return null;

  // Při hraní: minimální navbar – jen ikony, fullscreen dojem
  if (isFullscreenPlay) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10 backdrop-blur-xl">
        <div className="px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/play" className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="DestiGuess" onClick={() => playClick()}>
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => { playClick(); setMuted(!muted); }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label={muted ? 'Zapnout zvuk' : 'Vypnout zvuk'}
            >
              {muted ? <VolumeX className="w-5 h-5 text-gray-500" /> : <Volume2 className="w-5 h-5 text-gray-300" />}
            </button>
            <Link href="/settings" className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Nastavení" onClick={() => playClick()}>
              <Settings className="w-5 h-5 text-gray-300" />
            </Link>
            <Link href="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors" aria-label="Domů" onClick={() => playClick()}>
              <Home className="w-5 h-5 text-gray-300" />
            </Link>
            {user ? (
              <Link href="/profile" className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" aria-label="Profil" onClick={() => playClick()}>
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <User className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/auth" className="p-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-white transition-colors" aria-label="Přihlásit" onClick={() => playClick()}>
                <LogIn className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-emerald-400 to-white bg-clip-text text-transparent hover:opacity-80 transition-opacity" onClick={() => playClick()}>
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                <span className="hidden sm:inline">DestiGuess</span>
                <span className="sm:hidden">DG</span>
              </Link>
            </motion.div>
            <Link href="/play" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors hidden sm:inline" onClick={() => playClick()}>
              Hrát
            </Link>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => { playClick(); setMuted(!muted); }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label={muted ? 'Zapnout zvuk' : 'Vypnout zvuk'}
            >
              {muted ? <VolumeX className="w-5 h-5 text-gray-500" /> : <Volume2 className="w-5 h-5 text-gray-400" />}
            </button>
            <Link
              href="/settings"
              onClick={() => playClick()}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Nastavení"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </Link>
            {user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/profile"
                  onClick={() => playClick()}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-white/5 transition-colors border border-white/10 hover:border-emerald-500/30"
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-emerald-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs sm:text-sm font-semibold border-2 border-emerald-500/30">
                      {profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium">
                    {profile?.username || profile?.email?.split('@')[0] || 'Profil'}
                  </span>
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hidden sm:block" />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth"
                  onClick={() => playClick()}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-sm sm:text-base"
                >
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Přihlásit se</span>
                  <span className="sm:hidden">Přihlásit</span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
