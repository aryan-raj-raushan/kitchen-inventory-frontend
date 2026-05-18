'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingCart,
  Package,
  ClipboardList,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_LINKS = [
  { href: '/pos', label: 'Point of Sale', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/combos', label: 'Combos & Thalis', icon: Layers },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/coupons', label: 'Coupons', icon: Tag },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-slate-900 border-r border-slate-800">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Package size={14} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">Kitchen Inventory</p>
              <p className="text-slate-500 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900 border-t border-slate-800">
        <div className="flex overflow-x-auto">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
                  active ? 'text-indigo-400' : 'text-slate-400'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.75} />
                {label.split(' ')[0]}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium text-slate-400"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
