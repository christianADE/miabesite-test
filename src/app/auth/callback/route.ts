import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard/sites';

  console.log("Auth callback triggered with code:", code ? "present" : "missing");

  if (code) {
    try {
      const supabase = createClient();
      const { error, data } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Error exchanging code for session:", error);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?message=${encodeURIComponent('Erreur: ' + error.message)}`
        );
      }
      
      if (data?.session) {
        console.log("Session exchanged successfully, redirecting to:", next);
        return NextResponse.redirect(requestUrl.origin + next);
      } else {
        console.warn("No session returned after code exchange");
        return NextResponse.redirect(requestUrl.origin + next);
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?message=${encodeURIComponent('Erreur inattendue. Veuillez réessayer.')}`
      );
    }
  }

  console.warn("No code provided in auth callback");
  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=${encodeURIComponent('Pas de code d\'authentification fourni.')}`
  );
}