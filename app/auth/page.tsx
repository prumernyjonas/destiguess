'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameSounds } from '@/components/GameAudio';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { playClick, playSubmit, playError } = useGameSounds();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Sync user with database
        await fetch('/api/user/sync', { method: 'POST' });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        // Sync user with database
        await fetch('/api/user/sync', { method: 'POST' });
      }
      router.refresh();
      router.push('/play');
    } catch (err: any) {
      setError(err.message || 'Nastala chyba');
      playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              DestiGuess
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Přihlaste se' : 'Vytvořte účet'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Uživatelské jméno
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="volitelné"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="vas@email.cz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Heslo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              onClick={() => playSubmit()}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none"
            >
              {loading ? 'Načítání...' : isLogin ? 'Přihlásit se' : 'Vytvořit účet'}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => { playClick(); setIsLogin(!isLogin); setError(null); }}
              className="text-emerald-400 hover:text-emerald-300 text-sm"
            >
              {isLogin ? 'Nemáte účet? Zaregistrujte se' : 'Již máte účet? Přihlaste se'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
