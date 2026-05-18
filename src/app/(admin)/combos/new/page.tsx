'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { ComboForm } from '@/components/combos/ComboForm';
import { create } from '@/services/combo.service';
import type { CreateComboRequest } from '@/types';

export default function NewComboPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CreateComboRequest) {
    setIsSubmitting(true);
    setError(null);
    try {
      await create(data);
      toast.success('Combo created');
      router.push('/combos');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create combo';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/combos" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Combo / Thali</h1>
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
        <ComboForm onSubmit={handleSubmit} isSubmitting={isSubmitting} error={error} />
      </div>
    </div>
  );
}
