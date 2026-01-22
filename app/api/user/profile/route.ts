import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/supabase-db';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let profile = await db.getUserBySupabaseId(user.id);

    // Create profile if doesn't exist
    if (!profile) {
      profile = await db.createUser({
        supabase_id: user.id,
        email: user.email!,
        username: user.user_metadata?.username || user.email?.split('@')[0] || null,
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
