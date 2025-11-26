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

  // 1. Check if the requesting user is a super_admin
  if (!(await isSuperAdmin(supabase, user))) {
    return NextResponse.json({ error: 'Forbidden: Seuls les Super Admins peuvent accéder à l\'historique des transactions.' }, { status: 403 });
  }

  try {
    const { data: transactions, error: fetchError } = await supabase
      .from('coin_transactions')
      .select(`
        *,
        sender_profile:sender_id(full_name, email),
        recipient_profile:recipient_id(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error("Error fetching coin transactions:", fetchError);
      return NextResponse.json({ error: 'Erreur lors du chargement des transactions de pièces.' }, { status: 500 });
    }

    return NextResponse.json({ transactions }, { status: 200 });

  } catch (error: any) {
    console.error("API route error for admin coin transactions:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}