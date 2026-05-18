'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/common/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) return null;

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0 md:ml-60 p-5 md:p-6">
        {children}
      </main>
    </div>
  );
}
