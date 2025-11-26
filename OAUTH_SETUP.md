/**
 * DIAGNOSTIC: Supabase Configuration & OAuth Setup
 * 
 * To enable Google OAuth and fix signup network errors:
 */

// 1. SUPABASE CONFIGURATION CHECK
// ================================
// Verify these environment variables are set in .env.local:
// - NEXT_PUBLIC_SUPABASE_URL (must be your Supabase project URL)
// - NEXT_PUBLIC_SUPABASE_ANON_KEY (must be valid public key)

// Test in browser console:
// fetch('https://your-supabase-url/auth/v1/health', {
//   headers: { 'Authorization': 'Bearer YOUR_ANON_KEY' }
// }).then(r => r.json()).then(console.log)

// 2. ENABLE GOOGLE OAUTH
// ======================
// Steps:
// a) Go to Supabase Dashboard → Authentication → Providers
// b) Click "Google" and enable it
// c) Configure Google OAuth credentials:
//    - Go to Google Cloud Console: https://console.cloud.google.com/
//    - Create OAuth 2.0 credentials (OAuth Consent Screen + Web Application)
//    - Add authorized redirect URIs:
//      * http://localhost:3001/auth/callback (development)
//      * http://localhost:3000/auth/callback (if using port 3000)
//      * https://your-domain.com/auth/callback (production)
//    - Copy Client ID and Client Secret
// d) Paste into Supabase Google provider settings
// e) Save and enable

// 3. CORS CONFIGURATION
// =====================
// If getting CORS errors:
// - Supabase → Project Settings → API → CORS Allowed Origins
// - Add:
//   * http://localhost:3001
//   * http://localhost:3000
//   * https://your-domain.com

// 4. EMAIL CONFIGURATION
// ======================
// For email confirmation, either:
// Option A: Use Supabase SMTP (Production)
//   - Settings → Authentication → Email → Custom SMTP
//   - Configure with your email provider
//   
// Option B: Disable email verification (Development Only)
//   - Settings → Authentication → User Signup
//   - Disable "Confirm Email" option
//   - Note: NOT recommended for production

// 5. COMMON ERRORS & FIXES
// ========================

// Error: "NetworkError: Failed to fetch"
// Cause: Invalid SUPABASE_URL or ANON_KEY
// Fix: Verify env variables are correct

// Error: "Invalid OAuth provider"
// Cause: Google OAuth not enabled in Supabase
// Fix: Follow step 2 above

// Error: "Redirect URL doesn't match"
// Cause: OAuth redirect URI not configured in Google Console
// Fix: Add http://localhost:3001/auth/callback to authorized URIs

// Error: "Email provider not configured"
// Cause: SMTP not setup for email confirmations
// Fix: Either configure SMTP or disable email verification

// 6. TESTING ENDPOINTS
// ====================

// Test auth endpoint:
// curl -X POST https://your-supabase-url/auth/v1/signup \
//   -H "apikey: YOUR_ANON_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{
//     "email": "test@example.com",
//     "password": "SecurePassword123!",
//     "data": {
//       "full_name": "Test User",
//       "first_name": "Test",
//       "last_name": "User"
//     }
//   }'

// 7. BROWSER CONSOLE DEBUGGING
// ============================
// Open browser DevTools (F12) and check:
// - Network tab: Look for failed requests to Supabase
// - Console tab: Check for JavaScript errors
// - Application tab: Check if localStorage has auth tokens

// 8. PRODUCTION CHECKLIST
// =======================
const PRODUCTION_CHECKLIST = {
  supabaseConfigured: false, // Set SUPABASE_URL and ANON_KEY
  googleOAuthEnabled: false, // Enable Google provider in Supabase
  googleOAuthCredentials: false, // Add Client ID/Secret to Supabase
  corsConfigured: false, // Add domain to CORS allowed origins
  emailConfigured: false, // Either SMTP or disable verification
  httpsEnabled: false, // Use HTTPS in production
  rateLimitingConfigured: false, // Adjust in middleware.ts
  securityHeadersEnabled: false, // Middleware.ts deployed
  environmentVariablesSecure: false, // .env.local NOT in Git
};

export const SETUP_INSTRUCTIONS = {
  google_oauth: `
    1. Go to https://console.cloud.google.com/
    2. Create new project or select existing
    3. Enable Google+ API
    4. Create OAuth 2.0 credentials (Web Application)
    5. Add authorized JavaScript origins:
       - http://localhost:3001
       - http://localhost:3000
       - https://your-production-domain.com
    6. Add authorized redirect URIs:
       - http://localhost:3001/auth/callback
       - http://localhost:3000/auth/callback
       - https://your-production-domain.com/auth/callback
    7. Copy Client ID and Client Secret
    8. Go to Supabase → Authentication → Providers → Google
    9. Paste Client ID and Client Secret
    10. Enable the provider
  `,
  
  email_configuration: `
    Option 1: Using Gmail (Development)
    - Go to Supabase → Authentication → Email Templates
    - Configure SMTP with Gmail:
      * SMTP Host: smtp.gmail.com
      * Port: 587 (TLS) or 465 (SSL)
      * Username: your-email@gmail.com
      * Password: App-specific password (not regular password)
    
    Option 2: Disable Email Verification (Development Only)
    - Go to Supabase → Authentication → User Signup
    - Uncheck "Confirm Email"
    - WARNING: Only use for testing!
  `,
};

export default PRODUCTION_CHECKLIST;
