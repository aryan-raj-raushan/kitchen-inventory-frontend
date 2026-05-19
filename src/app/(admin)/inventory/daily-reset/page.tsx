'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DailyResetPrompt } from '@/components/inventory/DailyResetPrompt';

export default function DailyResetPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/inventory"
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Reset</h1>
          <p className="text-sm text-slate-400 mt-0.5">Enter today&apos;s starting quantities</p>
        </div>
      </div>

      <DailyResetPrompt showEmpty />
    </div>
  );
}
