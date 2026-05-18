'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAll, remove as removeCoupon, update } from '@/services/coupon.service';
import type { ICoupon } from '@/types';

export function useCoupons() {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refetch() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAll();
      setCoupons(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load coupons';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleStatus(coupon: ICoupon) {
    try {
      const nextStatus = coupon.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
      await update(coupon._id, { status: nextStatus });
      toast.success(nextStatus === 'ACTIVE' ? 'Coupon activated' : 'Coupon deactivated');
      await refetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update coupon';
      setError(msg);
      toast.error(msg);
    }
  }

  async function deleteCoupon(id: string) {
    try {
      await removeCoupon(id);
      toast.success('Coupon deleted');
      await refetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete coupon';
      setError(msg);
      toast.error(msg);
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  return { coupons, isLoading, error, refetch, toggleStatus, deleteCoupon };
}
