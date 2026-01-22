'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CldUploadButton } from 'next-cloudinary';

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);

      // Load profile from database
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
      setLoading(false);
    };
    loadUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleUploadSuccess = async (result: any) => {
    setUploading(true);
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: result.info.secure_url }),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setUploading(false);
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-strong rounded-3xl p-8 space-y-8">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/20"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-emerald-500/20 flex items-center justify-center text-4xl">
                    {profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <CldUploadButton
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                  onSuccess={handleUploadSuccess}
                  className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full p-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </CldUploadButton>
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {profile?.username || profile?.email?.split('@')[0] || 'Uživatel'}
                </h1>
                <p className="text-gray-400">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Uživatelské jméno</div>
                <div className="text-lg">{profile?.username || 'Nenastaveno'}</div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="text-sm text-gray-400 mb-1">Email</div>
                <div className="text-lg">{profile?.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold rounded-xl transition-all duration-200"
            >
              Odhlásit se
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
