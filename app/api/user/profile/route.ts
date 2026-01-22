import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    // Create profile if doesn't exist
    if (!profile) {
      profile = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email!,
          username: user.user_metadata?.username || user.email?.split('@')[0] || null,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
