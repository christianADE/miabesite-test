import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getServerUser, isSuperAdmin } from '@/lib/serverAuth';
import { CommunityCreationSchema } from '@/lib/schemas/community-schema';
import { generateUniqueCommunityJoinCode } from '@/lib/utils';

export async function POST(request: Request) {
  const supabase = createClient();

  const user = await getServerUser(supabase);

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier le rôle de l'utilisateur - seul un super_admin peut créer des communautés via ce panneau
  if (!(await isSuperAdmin(supabase, user))) {
    return NextResponse.json({ message: 'Forbidden: Super Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const validation = CommunityCreationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: 'Invalid data', errors: validation.error.flatten() }, { status: 400 });
  }

  const { name, description, utility, positioningDomain, template_1, template_2, category, is_public } = validation.data;

  try {
    let joinCode: string | null = null;
    if (!is_public) {
      joinCode = await generateUniqueCommunityJoinCode(supabase);
    }

    const { data: newCommunity, error: insertError } = await supabase
      .from('communities')
      .insert({
        name,
        description,
        utility,
        positioning_domain: positioningDomain,
        template_1,
        template_2,
        category,
        is_public,
        join_code: joinCode,
        owner_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erreur Supabase lors de l'insertion de la communauté:", insertError);
      return NextResponse.json({ message: `Failed to create community: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Community created successfully', community: newCommunity }, { status: 201 });

  } catch (error: any) {
    console.error("Erreur inattendue lors de la création de la communauté:", error);
    return NextResponse.json({ message: `An unexpected error occurred: ${error.message}` }, { status: 500 });
  }
}