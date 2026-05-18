'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useCoupons } from '@/hooks/useCoupons';
import { CouponList } from '@/components/coupons/CouponList';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';

export default function CouponsPage() {
  const { coupons, isLoading, error, toggleStatus, deleteCoupon } = useCoupons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
        <Link
          href="/coupons/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Coupon
        </Link>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <CouponList
          coupons={coupons}
          onToggleStatus={toggleStatus}
          onDelete={deleteCoupon}
        />
      )}
    </div>
  );
}
