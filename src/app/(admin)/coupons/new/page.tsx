'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
      router.push('/coupons');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create coupon');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Coupon</h1>
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
