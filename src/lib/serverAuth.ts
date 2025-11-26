import { createClient } from './supabase/server';
import type { User } from '@supabase/supabase-js';

// Helper used by server-side route handlers to obtain the authenticated user.
// Returns the user object if present, otherwise returns null.
// Use in route handlers like:
// const supabase = createClient();
// const user = await getServerUser(supabase);
// if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function getServerUser(supabase: ReturnType<typeof createClient>): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// Fetch user profile with role
export async function getUserProfile(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, coin_points')
    .eq('id', userId)
    .single();
  
  return { profile, error };
}

// Check if user has super_admin role
export async function isSuperAdmin(supabase: ReturnType<typeof createClient>, user: User): Promise<boolean> {
  const { profile, error } = await getUserProfile(supabase, user.id);
  if (error || !profile) return false;
  return profile.role === 'super_admin';
}

// Check if user has community_admin or super_admin role
export async function isCommunityAdminOrHigher(supabase: ReturnType<typeof createClient>, user: User): Promise<boolean> {
  const { profile, error } = await getUserProfile(supabase, user.id);
  if (error || !profile) return false;
  return profile.role === 'community_admin' || profile.role === 'super_admin';
}

export default getServerUser;
