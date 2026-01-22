import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/supabase-db';

// This route syncs Supabase user with database
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists
    let dbUser = await db.getUserBySupabaseId(user.id);

    // Create user if doesn't exist
    if (!dbUser) {
      dbUser = await db.createUser({
        supabase_id: user.id,
        email: user.email!,
        username: user.user_metadata?.username || user.email?.split('@')[0] || null,
      });
    }

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
