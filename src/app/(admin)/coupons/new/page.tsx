'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { CouponForm } from '@/components/coupons/CouponForm';
import { create } from '@/services/coupon.service';
import type { CreateCouponRequest } from '@/types';

export default function NewCouponPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: CreateCouponRequest) {
    setIsSaving(true);
    setError(null);
    try {
      await create(data);
      toast.success('Coupon created');
      router.push('/coupons');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to create coupon';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-lg animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/coupons" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Coupon</h1>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <CouponForm
          onSubmit={handleSubmit}
          isSaving={isSaving}
          error={error}
          onCancel={() => router.push('/coupons')}
        />
      </div>
    </div>
  );
}
