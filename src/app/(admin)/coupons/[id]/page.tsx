'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CouponForm } from '@/components/coupons/CouponForm';
import { getById, update } from '@/services/coupon.service';
import { Spinner } from '@/components/common/Spinner';
import type { ICoupon, CreateCouponRequest } from '@/types';

export default function EditCouponPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [coupon, setCoupon] = useState<ICoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getById(id)
      .then(setCoupon)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load coupon'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: Partial<CreateCouponRequest>) {
    setIsSaving(true);
    setError(null);
    try {
      await update(id, data);
      router.push('/coupons');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update coupon');
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="text-center py-16 text-slate-400">Coupon not found.</div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Coupon</h1>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <CouponForm
          initial={coupon}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          error={error}
          onCancel={() => router.push('/coupons')}
        />
      </div>
    </div>
  );
}
