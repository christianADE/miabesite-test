# 🔧 Signup Network Error - Troubleshooting Guide

## Problem
**Signup returns "NetworkError" despite having internet connection**

## Root Causes & Solutions

### 1. **Invalid Supabase Configuration** (Most Common)

#### Check your environment variables:
```bash
# In .env.local, verify these are set:
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-public-anon-key"
```

#### Test in browser console:
```javascript
// Check if Supabase client is initialized
const { createClient } = await import('@/lib/supabase/client.ts');
const supabase = createClient();
console.log(supabase); // Should show client object, not undefined
```

#### ✅ Fix:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API → Copy your URL and Anon Key
4. Update `.env.local` with correct values
5. Restart dev server: `pnpm dev`

---

### 2. **CORS Misconfiguration**

#### Symptoms:
- Network tab shows request to Supabase fails with CORS error
- Error mentions "Access-Control-Allow-Origin"

#### ✅ Fix:
1. Go to Supabase Dashboard → Settings → API
2. Scroll to "CORS Allowed Origins"
3. Add these origins:
   ```
   http://localhost:3001
   http://localhost:3000
   https://your-production-domain.com
   ```
4. Save changes
5. Refresh the browser

---

### 3. **Email Configuration Missing**

#### Symptoms:
- Signup appears to work but returns "Email provider not configured"
- No confirmation email sent

#### ✅ Fix Option A: Disable Email Verification (Development Only)
1. Supabase Dashboard → Authentication → User Signup
2. Uncheck "Confirm Email"
3. Save

#### ✅ Fix Option B: Configure SMTP (Production)
1. Supabase Dashboard → Authentication → Email Templates
2. Click "Custom SMTP Settings"
3. Configure with Gmail:
   ```
   SMTP Host: smtp.gmail.com
   Port: 587 (TLS)
   Username: your-email@gmail.com
   Password: [App-specific password, not regular Gmail password]
   From Email: noreply@your-domain.com
   ```
4. Test configuration
5. Save

---

### 4. **Network/Firewall Issues**

#### Test connectivity:
```bash
# Test from command line
curl -i https://your-supabase-url/auth/v1/health

# Should return 200 OK
```

#### ✅ Fix:
- Check if you're behind a corporate firewall
- Try using a different network (mobile hotspot)
- Check if your ISP blocks API calls (unlikely)

---

### 5. **Browser Cache/Cookies**

#### ✅ Fix:
1. Clear browser cache and cookies
2. Open DevTools (F12) → Application → Clear Site Data
3. Reload the page
4. Try signup again

---

## Browser Console Debugging

Open DevTools (F12) and check the Console tab when attempting signup:

```javascript
// You should see these logs:
"Attempting signup with: {email: "...", fullName: "..."}"
// And then one of:
"Signup successful: user-id"  // Success
"Erreur Supabase Auth: {...}"  // Auth error
"Erreur lors de l'inscription: ..." // Network error
```

If you see "NetworkError: Failed to fetch":
- Check Network tab for failed requests
- Click on failed request → Response tab for details

---

## Step-by-Step Verification

### Step 1: Verify Environment Variables
```bash
# Run this in your terminal
echo $env:NEXT_PUBLIC_SUPABASE_URL
echo $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Both should output non-empty values.

### Step 2: Test Supabase Connection
```javascript
// In browser console
fetch('https://your-supabase-url/auth/v1/health', {
  headers: {
    'apikey': 'your-anon-key'
  }
})
.then(r => r.json())
.then(console.log)
```

Should return: `{version: "x.x.x", name: "PostgreSQL", ...}`

### Step 3: Restart Dev Server
```bash
# Stop current server (Ctrl+C in terminal)
# Then restart
pnpm dev
```

### Step 4: Test Signup
1. Go to http://localhost:3001/signup
2. Fill in the form
3. Open DevTools Console (F12)
4. Click "S'inscrire"
5. Check console logs for errors

---

## Google OAuth Setup (To Enable Alternative Login)

### Prerequisites:
- Google Cloud Console account
- Supabase project

### Steps:

#### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials:
   - Click "Create Credentials" → "OAuth Client ID"
   - Choose "Web Application"
   - Add Authorized JavaScript Origins:
     ```
     http://localhost:3001
     http://localhost:3000
     https://your-domain.com
     ```
   - Add Authorized Redirect URIs:
     ```
     http://localhost:3001/auth/callback
     http://localhost:3000/auth/callback
     https://your-domain.com/auth/callback
     ```
   - Copy Client ID and Client Secret

#### 2. Configure in Supabase
1. Supabase Dashboard → Authentication → Providers
2. Find "Google" and click enable
3. Paste Client ID and Client Secret
4. Save

#### 3. Test
1. Go to http://localhost:3001/signup or /login
2. Click "Google" button
3. Should redirect to Google login
4. After login, should redirect back to your app

---

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid API key" | Wrong ANON_KEY | Update `.env.local` |
| "Failed to fetch" | CORS blocked | Add origin to Supabase CORS settings |
| "Email provider not configured" | SMTP not setup | Disable email verification or setup SMTP |
| "Invalid OAuth redirect URI" | Google OAuth not configured | Follow OAuth setup steps above |
| "NetworkError: fetch failed" | No internet or wrong URL | Check URL and internet connection |

---

## Quick Checklist

- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase CORS settings include `http://localhost:3001`
- [ ] Email verification disabled OR SMTP configured
- [ ] Dev server restarted after env changes
- [ ] Browser cache cleared
- [ ] Can reach Supabase health endpoint
- [ ] Google OAuth credentials configured (optional)
- [ ] Google OAuth enabled in Supabase (optional)

---

## Still Having Issues?

1. **Check server logs**: Look at the terminal where `pnpm dev` is running for errors
2. **Check browser console**: F12 → Console tab for JavaScript errors
3. **Check Network tab**: F12 → Network tab → Look for failed requests to `supabase.co`
4. **Verify Supabase status**: https://status.supabase.com/

---

**Last Updated**: 2025-11-25
