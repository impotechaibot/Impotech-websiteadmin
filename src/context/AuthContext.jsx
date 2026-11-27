import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const AuthContext = createContext(null);
const DEMO_SESSION_KEY = 'impotech_admin_session';

async function verifyAdmin(session) {
  if (!session?.user) return false;
  if (!isSupabaseConfigured) return Boolean(session.demo && session.user.role === 'admin');
  try {
    const { data, error } = await supabase.from('admin_users').select('id,role').eq('id', session.user.id).maybeSingle();
    if (error) {
      console.warn('[admin-auth] admin verification failed:', error.message);
      return false;
    }
    return Boolean(data && (data.role === 'admin' || data.role === 'owner'));
  } catch (error) {
    console.warn('[admin-auth] admin verification failed:', error?.message || error);
    return false;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        const raw = localStorage.getItem(DEMO_SESSION_KEY);
        if (raw) {
          const demo = JSON.parse(raw);
          setSession(demo);
          setIsAdmin(Boolean(demo?.demo && demo?.user?.role === 'admin'));
        }
      } catch { /* ignore corrupt demo session */ }
      setLoading(false);
      return undefined;
    }

    let alive = true;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!alive) return;
      const current = error ? null : data.session;
      setSession(current);
      setIsAdmin(await verifyAdmin(current));
      if (alive) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current);
      // Defer admin lookup so it does not block Supabase's auth event callback.
      Promise.resolve().then(async () => {
        const ok = await verifyAdmin(current);
        setIsAdmin(ok);
      });
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Production must never accept arbitrary credentials in demo mode.
      if (import.meta.env.PROD) {
        return { error: { message: 'Supabase কনফিগার করা নেই। Production Admin login বন্ধ আছে; VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY সেট করুন।' } };
      }
      if (!email || !password) return { error: { message: 'ইমেইল ও পাসওয়ার্ড দিন' } };
      const demo = { user: { id: 'demo-admin', email, role: 'admin' }, demo: true, at: new Date().toISOString() };
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demo));
      setSession(demo);
      setIsAdmin(true);
      return { error: null };
    }
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) return result;
    const ok = await verifyAdmin(result.data.session);
    if (!ok) {
      await supabase.auth.signOut();
      setSession(null);
      setIsAdmin(false);
      return { error: { message: 'এই অ্যাকাউন্টটি Admin হিসেবে অনুমোদিত নয়। admin_users টেবিলে Admin row যাচাই করুন।' } };
    }
    setSession(result.data.session);
    setIsAdmin(true);
    return result;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setSession(null);
      setIsAdmin(false);
      return;
    }
    setIsAdmin(false);
    return supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, isAdmin, loading, signIn, signOut, demoMode: !isSupabaseConfigured }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
