import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env.local with vanilla JS
const envContent = readFileSync('.env.local', 'utf-8');
const envConfig = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      envConfig[key] = val;
    }
  }
}
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

async function runTests() {
  console.log('=== STARTING SUPABASE AUTH INTEGRATION TEST ===\n');

  const testEmail = `founder_${Date.now()}@venture.co`;
  const testPassword = 'Password123!Secure';

  // 1. Test Sign Up
  console.log(`[Step 1] Testing signUp for: ${testEmail}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.log('⚠️ Sign Up note:', signUpError.message);
  } else {
    console.log('✅ Sign Up successful! User ID:', signUpData.user?.id);
  }

  // 2. Test Sign In with Password
  console.log('\n[Step 2] Testing signInWithPassword...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    if (signInError.message.includes('Email not confirmed')) {
      console.log('ℹ️ Email confirmation required by Supabase project settings. (Expected when auto-confirm is off)');
    } else {
      console.log('⚠️ Sign In note:', signInError.message);
    }
  } else {
    console.log('✅ Sign In successful! Session established. Access Token length:', signInData.session?.access_token.length);

    // 3. Test Session Persistence (getSession)
    console.log('\n[Step 3] Testing getSession persistence (simulating page refresh)...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error('❌ Failed to retrieve persisted session:', sessionError?.message);
    } else {
      console.log('✅ Persisted session retrieved successfully! User:', sessionData.session.user.email);
    }

    // 4. Test Sign Out
    console.log('\n[Step 4] Testing signOut...');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('❌ Failed to sign out:', signOutError.message);
    } else {
      console.log('✅ Sign out successful!');
      const { data: afterSignOut } = await supabase.auth.getSession();
      console.log('✅ Verified session cleared after signOut:', afterSignOut.session === null);
    }
  }

  // 5. Test Password Reset request
  console.log('\n[Step 5] Testing resetPasswordForEmail...');
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail);
  if (resetError) {
    console.log('ℹ️ Reset password note:', resetError.message);
  } else {
    console.log('✅ Password reset request dispatched successfully.');
  }

  // 6. Test HTTP endpoint for /login to verify UI elements
  console.log('\n[Step 6] Testing HTTP GET http://localhost:3000/login...');
  try {
    const res = await fetch('http://localhost:3000/login');
    const html = await res.text();
    console.log('HTTP Status:', res.status);
    console.log('Contains "Sign In":', html.includes('Sign In') || html.includes('Sign in'));
    console.log('Contains "Create account":', html.includes('Create account') || html.includes('Create Account'));
    console.log('Contains "Forgot password":', html.includes('Forgot password'));
    console.log('Contains "Email me a link instead":', html.includes('Email me a link instead'));
    console.log('Contains Google OAuth (should be false):', html.includes('Continue with Google') || html.includes('signInWithOAuth'));
    console.log('Contains Zero vanity metrics:', html.includes('Zero vanity metrics'));
    console.log('Contains End-to-end confidential:', html.includes('End-to-end confidential'));
  } catch (httpErr) {
    console.error('❌ Could not fetch /login:', httpErr.message);
  }

  console.log('\n=== ALL AUTH FLOW TESTS COMPLETED ===');
}

runTests().catch(console.error);
