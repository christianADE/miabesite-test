import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/serverAuth';
import { ecommerceWizardSchema } from '@/lib/schemas/site-editor-form-schema';

// Simple slug generator (same rules as client-side)
function generateSlug(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function POST(request: Request) {
  const supabase = createClient();
  const user = await getServerUser(supabase);

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    const parseResult = ecommerceWizardSchema.safeParse(body.siteData ?? body);
    if (!parseResult.success) {
      console.error('Validation errors:', parseResult.error.flatten());
      return NextResponse.json({ error: 'Invalid site data', details: parseResult.error.flatten() }, { status: 400 });
    }

    const siteData = parseResult.data as any;
    const providedId = body.id as string | undefined;
    let subdomain = body.subdomain as string | undefined;

    // If updating an existing site
    if (providedId) {
      const { error: updateError, data: updated } = await supabase
        .from('sites')
        .update({ site_data: siteData, template_type: siteData.templateType })
        .eq('id', providedId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Site updated', id: updated.id, subdomain: updated.subdomain }, { status: 200 });
    }

    // Creating a new site: ensure we have a subdomain
    if (!subdomain) {
      const base = generateSlug(siteData.publicName || 'site');
      let candidate = base;
      let tries = 0;
      while (tries < 8) {
        const { data: existing } = await supabase.from('sites').select('id').eq('subdomain', candidate).maybeSingle();
        if (!existing) break;
        candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`;
        tries++;
      }
      subdomain = candidate;
    }

    const { data: insertData, error: insertError } = await supabase
      .from('sites')
      .insert({ user_id: user.id, subdomain, site_data: siteData, status: 'published', template_type: siteData.templateType || 'ecommerce' })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Site created', id: insertData.id, subdomain: insertData.subdomain }, { status: 201 });
  } catch (err: any) {
    console.error('API /api/sites error:', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
