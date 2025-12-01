import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerUser } from '@/lib/serverAuth';
import { ecommerceWizardSchema } from '@/lib/schemas/site-editor-form-schema';
import { TEMPLATE_GROUPS, FREE_ACCOUNT_SITE_LIMITS } from '@/lib/constants'; // Import constants

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

    // Check user role for site creation limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching user profile for site creation limits:", profileError);
      return NextResponse.json({ error: 'Profil utilisateur non trouvé.' }, { status: 404 });
    }

    // Apply limits only for 'user' role (free accounts) and if creating a new site
    if (profile.role === 'user' && !providedId) {
      const { data: userSites, error: fetchSitesError } = await supabase
        .from('sites')
        .select('template_type')
        .eq('user_id', user.id);

      if (fetchSitesError) {
        console.error("Error fetching user sites for limits:", fetchSitesError);
        return NextResponse.json({ error: 'Erreur lors de la vérification des limites de sites.' }, { status: 500 });
      }

      let portfolioServicesCount = 0;
      let ecommerceCount = 0;

      userSites?.forEach(site => {
        if (TEMPLATE_GROUPS.PORTFOLIO_SERVICES.includes(site.template_type)) {
          portfolioServicesCount++;
        } else if (TEMPLATE_GROUPS.ECOMMERCE.includes(site.template_type)) {
          ecommerceCount++;
        }
      });

      const newSiteTemplateType = siteData.templateType;

      if (TEMPLATE_GROUPS.PORTFOLIO_SERVICES.includes(newSiteTemplateType)) {
        if (portfolioServicesCount >= FREE_ACCOUNT_SITE_LIMITS.PORTFOLIO_SERVICES) {
          return NextResponse.json({ error: `Vous avez atteint la limite de ${FREE_ACCOUNT_SITE_LIMITS.PORTFOLIO_SERVICES} site(s) de type Portfolio/Services pour votre compte gratuit.` }, { status: 403 });
        }
      } else if (TEMPLATE_GROUPS.ECOMMERCE.includes(newSiteTemplateType)) {
        if (ecommerceCount >= FREE_ACCOUNT_SITE_LIMITS.ECOMMERCE) {
          return NextResponse.json({ error: `Vous avez atteint la limite de ${FREE_ACCOUNT_SITE_LIMITS.ECOMMERCE} site(s) de type E-commerce pour votre compte gratuit.` }, { status: 403 });
        }
      }
    }

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

export async function DELETE(request: Request) {
  const supabase = createClient();
  const user = await getServerUser(supabase);

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('id');

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
    }

    // Verify that the site belongs to the current user
    const { data: site, error: fetchError } = await supabase
      .from('sites')
      .select('user_id')
      .eq('id', siteId)
      .single();

    if (fetchError || !site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (site.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You cannot delete this site' }, { status: 403 });
    }

    // Delete the site
    const { error: deleteError } = await supabase
      .from('sites')
      .delete()
      .eq('id', siteId);

    if (deleteError) {
      console.error('Error deleting site:', deleteError);
      return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Site deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/sites error:', err);
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
  }
}
