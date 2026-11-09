import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, ShoppingCart, Ticket, Star, Users,
  Settings, Home, Palette, FileText, Search, BarChart3, Sparkles, X, Database,
  Receipt, Truck, Rocket, Wrench, RefreshCw, Plug, CreditCard, MessageSquare,
  RotateCcw, ShieldCheck, Megaphone, Gift, Boxes, Factory, ShoppingBag,
  Headphones, HelpCircle, ScrollText, Store, Globe, Github,
} from 'lucide-react';

/**
 * সাইডবার — গ্রুপভিত্তিক মেনু।
 * প্রতিটি গ্রুপে শিরোনাম থাকে, যাতে অনেক মেনুও সহজে খুঁজে পাওয়া যায়।
 */
const NAV = [
  {
    group: 'প্রধান',
    items: [
      { to: '/', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, end: true },
      { to: '/analytics', label: 'অ্যানালিটিক্স', icon: BarChart3 },
    ],
  },
  {
    group: 'ক্যাটালগ',
    items: [
      { to: '/products', label: 'প্রোডাক্ট', icon: Package },
      { to: '/categories', label: 'ক্যাটাগরি', icon: Tags },
      { to: '/services', label: 'সার্ভিস', icon: Wrench },
      { to: '/inventory', label: 'স্টক ও ইনভেন্টরি', icon: Boxes },
      { to: '/reviews', label: 'রিভিউ', icon: Star },
    ],
  },
  {
    group: 'বিক্রয়',
    items: [
      { to: '/orders', label: 'অর্ডার', icon: ShoppingCart },
      { to: '/invoices', label: 'ইনভয়েস', icon: Receipt },
      { to: '/courier', label: 'কুরিয়ার শিপমেন্ট', icon: Truck },
      { to: '/returns', label: 'রিটার্ন ও রিফান্ড', icon: RotateCcw },
      { to: '/warranties', label: 'ওয়ারেন্টি', icon: ShieldCheck },
      { to: '/customers', label: 'কাস্টমার', icon: Users },
    ],
  },
  {
    group: 'মার্কেটিং',
    items: [
      { to: '/coupons', label: 'কুপন', icon: Ticket },
      { to: '/campaigns', label: 'ক্যাম্পেইন', icon: Megaphone },
      { to: '/loyalty', label: 'লয়্যালটি ও পয়েন্ট', icon: Gift },
      { to: '/landing', label: 'ল্যান্ডিং পেজ', icon: Rocket },
    ],
  },
  {
    group: 'সাপ্লাই চেইন',
    items: [
      { to: '/suppliers', label: 'সাপ্লায়ার', icon: Factory },
      { to: '/purchases', label: 'পারচেজ', icon: ShoppingBag },
      { to: '/vendors', label: 'ভেন্ডর ও ওয়্যারহাউস', icon: Store },
    ],
  },
  {
    group: 'সাপোর্ট',
    items: [
      { to: '/support', label: 'কাস্টমার সাপোর্ট', icon: Headphones },
      { to: '/faqs', label: 'FAQ', icon: HelpCircle },
      { to: '/policies', label: 'পলিসি পেজ', icon: ScrollText },
    ],
  },
  {
    group: 'ইন্টিগ্রেশন',
    items: [
      { to: '/integrations', label: 'ইন্টিগ্রেশন হাব', icon: Plug },
      { to: '/payment', label: 'পেমেন্ট গেটওয়ে', icon: CreditCard },
      { to: '/courier-settings', label: 'কুরিয়ার সেটিংস', icon: Truck },
      { to: '/sms', label: 'SMS ও নোটিফিকেশন', icon: MessageSquare },
      { to: '/analytics-settings', label: 'ট্র্যাকিং সেটিংস', icon: BarChart3 },
      { to: '/marketing', label: 'মার্কেটিং সেটিংস', icon: Megaphone },
    ],
  },
  {
    group: 'সাইট',
    items: [
      { to: '/home', label: 'হোম কনটেন্ট', icon: Home },
      { to: '/theme', label: 'থিম', icon: Palette },
      { to: '/content', label: 'কনটেন্ট পেজ', icon: FileText },
      { to: '/seo', label: 'SEO', icon: Search },
      { to: '/seo-advanced', label: 'SEO অ্যাডভান্সড', icon: Globe },
      { to: '/settings', label: 'সাইট সেটিংস', icon: Settings },
    ],
  },
  {
    group: 'সিস্টেম',
    items: [
      { to: '/ai', label: 'AI অ্যাসিস্ট্যান্ট', icon: Sparkles },
      { to: '/backup', label: 'ব্যাকআপ', icon: Database },
      { to: '/update', label: 'আপডেট', icon: RefreshCw },
      { to: '/deploy', label: 'ডিপ্লয় গাইড', icon: Github },
      { to: '/github', label: 'GitHub পুশ', icon: Github },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full w-64 shrink-0
          bg-surface border-r border-line flex flex-col transition-transform
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-line shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-accent grid place-items-center text-black font-bold">
              ই
            </span>
            <span className="font-semibold">ইম্পোটেক অ্যাডমিন</span>
          </div>
          <button className="lg:hidden text-ink-muted" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {NAV.map((section) => (
            <div key={section.group}>
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted/70">
                {section.group}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-field text-sm transition-colors ${
                        isActive
                          ? 'bg-accent/15 text-accent font-medium'
                          : 'text-ink-muted hover:bg-surface2 hover:text-ink'
                      }`
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
