'use client';

import { useState, useEffect } from 'react';
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
      setError(e instanceof Error ? e.message : 'Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleStatus(coupon: ICoupon) {
    try {
      const nextStatus = coupon.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
      await update(coupon._id, { status: nextStatus });
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update coupon');
    }
  }

  async function deleteCoupon(id: string) {
    try {
      await removeCoupon(id);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete coupon');
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  return { coupons, isLoading, error, refetch, toggleStatus, deleteCoupon };
}
