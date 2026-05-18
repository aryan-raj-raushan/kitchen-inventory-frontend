'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { href: '/pos', label: 'POS', icon: '🛒' },
  { href: '/inventory', label: 'Inventory', icon: '📦' },
  { href: '/orders', label: 'Orders', icon: '📋' },
  { href: '/coupons', label: 'Coupons', icon: '🎟' },
  { href: '/reports', label: 'Reports', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 flex-col bg-slate-900 text-white">
        <div className="px-6 py-5 border-b border-slate-700">
          <span className="font-semibold text-sm tracking-wide text-slate-300">RESTAURANT POS</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900 border-t border-slate-700 flex">
        {NAV_LINKS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              pathname.startsWith(href) ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium text-slate-400"
        >
          <span className="text-base">🚪</span>
          Logout
        </button>
      </nav>
    </>
  );
}
