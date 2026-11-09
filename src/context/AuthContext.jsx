import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const AuthContext = createContext(null);

const DEMO_SESSION_KEY = 'impotech_admin_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ---------- ডেমো মোড (Supabase নেই) ----------
    if (!isSupabaseConfigured) {
      try {
        const raw = localStorage.getItem(DEMO_SESSION_KEY);
        if (raw) setSession(JSON.parse(raw));
      } catch {
        /* ignore */
      }
      setLoading(false);
      return;
    }

    // ---------- আসল Supabase Auth ----------
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      // ডেমো: যেকোনো ইমেইল/পাসওয়ার্ড গ্রহণ (খালি নয়)
      if (!email || !password) return { error: { message: 'ইমেইল ও পাসওয়ার্ড দিন' } };
      const demo = {
        user: { id: 'demo-admin', email, role: 'admin' },
        demo: true,
        at: new Date().toISOString(),
      };
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demo));
      setSession(demo);
      return { error: null };
    }
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setSession(null);
      return;
    }
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signOut,
        demoMode: !isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
