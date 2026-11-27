import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { signIn, user, isAdmin, demoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(demoMode ? 'admin@impotech.com.bd' : '');
  const [password, setPassword] = useState(demoMode ? 'impotech2026' : '');
  const [busy, setBusy] = useState(false);

  if (user && isAdmin) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('ইমেইল ও পাসওয়ার্ড দিন');
      return;
    }
    setBusy(true);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) {
      toast.error('লগইন ব্যর্থ: ' + error.message);
      return;
    }
    toast.success('স্বাগতম!');
    navigate(location.state?.from?.pathname || '/', { replace: true });
  };

  return (
    <div className="min-h-full grid place-items-center p-4 bg-bg">
      <form onSubmit={submit} className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="w-12 h-12 rounded-xl bg-accent grid place-items-center
            text-black font-bold text-xl mx-auto">ই</span>
          <h1 className="text-xl font-semibold mt-3">ইম্পোটেক অ্যাডমিন</h1>
          <p className="text-sm text-ink-muted mt-1">কন্ট্রোল প্যানেলে লগইন করুন</p>
        </div>

        {demoMode && (
          <div className="mb-5 rounded-field border border-accent/40 bg-accent/10 px-3 py-2.5 text-xs text-accent">
            <b>ডেমো মোড</b> — Supabase কনফিগার করা নেই। যেকোনো ইমেইল/পাসওয়ার্ড দিয়েই লগইন করুন
            (ডিফল্ট আগেই বসানো আছে)। ডেটা ব্রাউজারে সেভ থাকবে।
          </div>
        )}

        <label className="label">ইমেইল</label>
        <input
          className="input mb-4"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@impotech.com.bd"
        />

        <label className="label">পাসওয়ার্ড</label>
        <input
          className="input mb-6"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button className="btn-primary w-full justify-center" disabled={busy}>
          {busy ? 'লগইন হচ্ছে…' : 'লগইন'}
        </button>
      </form>
    </div>
  );
}
