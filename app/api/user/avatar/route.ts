import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { avatarUrl } = await request.json();

    let profile = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    if (!profile) {
      profile = await prisma.user.create({
        data: {
          supabaseId: user.id,
          email: user.email!,
          username: user.user_metadata?.username || user.email?.split('@')[0] || null,
          avatarUrl,
        },
      });
    } else {
      profile = await prisma.user.update({
        where: { supabaseId: user.id },
        data: { avatarUrl },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
