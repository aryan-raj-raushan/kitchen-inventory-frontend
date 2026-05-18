'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { CouponForm } from '@/components/coupons/CouponForm';
import { getById, update } from '@/services/coupon.service';
import { Spinner } from '@/components/common/Spinner';
import type { ICoupon, CreateCouponRequest } from '@/types';

export default function EditCouponPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [coupon, setCoupon] = useState<ICoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getById(slug)
      .then(setCoupon)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load coupon'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(data: Partial<CreateCouponRequest>) {
    setIsSaving(true);
    setError(null);
    try {
      await update(slug, data);
      toast.success('Coupon updated');
      router.push('/coupons');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update coupon';
      setError(msg);
      toast.error(msg);
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
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <p className="text-lg font-medium">Coupon not found</p>
        <Link href="/coupons" className="text-indigo-600 text-sm hover:underline">Back to coupons</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/coupons" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Coupon</h1>
      </div>
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
