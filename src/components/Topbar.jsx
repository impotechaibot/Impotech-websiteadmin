import { Menu, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ onMenu }) {
  const { user, signOut, demoMode } = useAuth();
  const siteUrl = import.meta.env.VITE_SITE_URL || '#';

  return (
    <header className="h-16 shrink-0 bg-surface/80 backdrop-blur border-b border-line
      flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <button className="lg:hidden text-ink-muted" onClick={onMenu}>
        <Menu size={22} />
      </button>

      <div className="hidden lg:flex items-center gap-2 text-sm text-ink-muted">
        ইম্পোটেক স্টোর — কন্ট্রোল প্যানেল
        {demoMode && (
          <span className="badge bg-accent/15 text-accent text-[11px]">ডেমো মোড</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <a
          href={siteUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost text-sm hidden sm:inline-flex"
        >
          <ExternalLink size={16} /> সাইট দেখুন
        </a>
        <span className="text-sm text-ink-muted hidden md:inline">
          {user?.email}
        </span>
        <button className="btn-ghost text-sm" onClick={signOut}>
          <LogOut size={16} /> লগআউট
        </button>
      </div>
    </header>
  );
}
