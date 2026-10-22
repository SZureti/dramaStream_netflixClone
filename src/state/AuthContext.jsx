import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

async function redirectTo(fn, body) {
  if (!supabase) return { error: 'Billing isn’t available right now.' };
  const { data, error } = await supabase.functions.invoke(fn, {
    body: { ...body, returnUrl: `${window.location.origin}/account` },
  });
  if (error || !data?.url) return { error: 'Couldn’t open billing. Please try again.' };
  window.location.assign(data.url);
  return { error: null };
}

// Supabase's messages are written for developers; these are for viewers.
function friendlyError(error) {
  const msg = error?.message ?? '';
  if (/invalid login credentials/i.test(msg)) return 'That email and password don’t match an account.';
  if (/email not confirmed/i.test(msg)) return 'Confirm your email first: open the link we sent you.';
  if (/already registered|already exists/i.test(msg))
    return 'An account with this email already exists. Try signing in.';
  if (/password should be at least/i.test(msg)) return 'Use at least 8 characters for your password.';
  if (/rate limit|too many/i.test(msg)) return 'Too many tries. Wait a minute and try again.';
  if (/failed to fetch|network/i.test(msg)) return 'Can’t reach the server. Check your connection and try again.';
  return msg || 'Something went wrong. Please try again.';
}

/**
 * Optional sign-in with Supabase Auth. Signed-out visitors can still browse
 * everything; signing in saves My List and viewing progress to the account.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(!supabase); // nothing to wait for without Supabase
  const [recovering, setRecovering] = useState(false); // arrived from a password-reset link

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Each action resolves to { error: string | null, ... } so forms can show it.
  const run = useCallback(async (action) => {
    if (!supabase) return { error: 'Accounts aren’t available right now.' };
    try {
      const { data, error } = await action();
      return error ? { error: friendlyError(error) } : { error: null, data };
    } catch (err) {
      return { error: friendlyError(err) };
    }
  }, []);

  const value = useMemo(() => {
    const origin = window.location.origin;
    return {
      available: Boolean(supabase),
      ready,
      session,
      user: session?.user ?? null,
      recovering,
      signUp: async ({ email, password, plan = 'standard' }) => {
        const result = await run(() =>
          supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/`, data: { plan } } }),
        );
        // With email confirmation on, Supabase returns no session until the link is opened.
        return { ...result, needsConfirmation: !result.error && !result.data?.session };
      },
      signIn: ({ email, password }) => run(() => supabase.auth.signInWithPassword({ email, password })),
      signOut: () => run(() => supabase.auth.signOut()),
      // Ends every session for this account, on every device.
      signOutEverywhere: () => run(() => supabase.auth.signOut({ scope: 'global' })),
      // The mock plan lives in the user's metadata.
      changePlan: (plan) => run(() => supabase.auth.updateUser({ data: { plan } })),
      // Billing runs through Stripe-hosted pages; the Edge Functions return their URLs.
      startCheckout: (plan) => redirectTo('create-checkout-session', { plan }),
      openBillingPortal: () => redirectTo('create-portal-session', {}),
      sendPasswordReset: (email) =>
        run(() => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` })),
      updatePassword: async (password) => {
        const result = await run(() => supabase.auth.updateUser({ password }));
        if (!result.error) setRecovering(false);
        return result;
      },
    };
  }, [ready, session, recovering, run]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
