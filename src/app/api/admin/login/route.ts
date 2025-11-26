import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerUser, isSuperAdmin } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createClient();
  const user = await getServerUser(supabase);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!(await isSuperAdmin(supabase, user))) {
      return NextResponse.json({ error: 'Forbidden: Not a Super Admin' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Super Admin access granted', role: 'super_admin' }, { status: 200 });

  } catch (error: any) {
    console.error("API route error for admin login check:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}