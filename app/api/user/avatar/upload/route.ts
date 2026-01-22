import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/supabase-db';
import { cloudinary } from '@/lib/cloudinary';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    // Zkontrolovat Cloudinary konfiguraci
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary není nakonfigurované');
      return NextResponse.json(
        { error: 'Cloudinary není nakonfigurované. Zkontrolujte .env.local soubor.' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Zkontrolovat typ souboru
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Konvertovat File na Buffer pro Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Nahrát na Cloudinary pomocí Promise wrapperu
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          public_id: `avatar_${user.id}`,
          overwrite: true,
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error('Upload failed - no result'));
            return;
          }
          resolve(result);
        }
      );

      // Zapsat buffer do streamu
      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    });

    // Aktualizovat profil v databázi
    let profile = await db.getUserBySupabaseId(user.id);

    if (!profile) {
      profile = await db.createUser({
        supabase_id: user.id,
        email: user.email!,
        username: user.user_metadata?.username || user.email?.split('@')[0] || null,
        avatar_url: uploadResult.secure_url,
      });
    } else {
      profile = await db.updateUser(user.id, { avatar_url: uploadResult.secure_url });
    }

    return NextResponse.json({
      ...profile,
      avatarUrl: profile.avatar_url, // Pro kompatibilitu s frontendem
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: 'Nepodařilo se nahrát obrázek', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
