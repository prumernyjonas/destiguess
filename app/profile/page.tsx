'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameSounds } from '@/components/GameAudio';
import ImageCrop from '@/components/ImageCrop';
import { Upload } from 'lucide-react';

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
  const [cropImage, setCropImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const { playClick, playError } = useGameSounds();

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
    playClick();
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Zkontrolovat typ souboru
    if (!file.type.startsWith('image/')) {
      playError();
      alert('Prosím vyberte obrázek');
      return;
    }

    // Zkontrolovat velikost (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      playError();
      alert('Obrázek je příliš velký. Maximální velikost je 5MB.');
      return;
    }

    // Vytvořit URL pro náhled
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setCropImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCrop = async (croppedBlob: Blob) => {
    setUploading(true);
    setCropImage(null);
    
    try {
      // Vytvořit FormData
      const formData = new FormData();
      formData.append('file', croppedBlob, 'avatar.png');
      
      console.log('Uploading avatar, blob size:', croppedBlob.size);
      
      // Nahrát na Cloudinary přes API
      const response = await fetch('/api/user/avatar/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Upload failed:', responseData);
        throw new Error(responseData.error || responseData.details || 'Nepodařilo se nahrát obrázek');
      }

      console.log('Upload successful:', responseData);
      setProfile({
        ...responseData,
        avatarUrl: responseData.avatarUrl || responseData.avatar_url, // Podpora obou formátů
      });
      playClick();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      playError();
      alert(error instanceof Error ? error.message : 'Nepodařilo se nahrát obrázek');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelCrop = () => {
    setCropImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="glass-strong rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-3 border-emerald-500/30 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-800 border-3 border-emerald-500/30 flex items-center justify-center text-3xl font-semibold shadow-lg">
                  {profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                  className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-full p-1.5 sm:p-2 shadow-lg transition-colors"
              >
                {uploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {profile?.username || profile?.email?.split('@')[0] || 'Uživatel'}
              </h1>
              <p className="text-sm sm:text-base text-gray-400 mt-1">{profile?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-white/5">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Uživatelské jméno</div>
              <div className="text-base sm:text-lg font-medium">{profile?.username || 'Nenastaveno'}</div>
            </div>
            <div className="p-3 sm:p-4 bg-gray-900/50 rounded-lg border border-white/5">
              <div className="text-xs sm:text-sm text-gray-400 mb-1">Email</div>
              <div className="text-base sm:text-lg font-medium">{profile?.email}</div>
            </div>
          </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
            Odhlásit se
          </button>
        </motion.div>
      </div>

      {cropImage && (
        <ImageCrop
          imageSrc={cropImage}
          onCrop={handleCrop}
          onCancel={handleCancelCrop}
          aspectRatio={1}
        />
      )}
    </div>
  );
}
