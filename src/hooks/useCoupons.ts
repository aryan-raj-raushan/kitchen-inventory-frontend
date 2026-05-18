'use client';

import { useState, useEffect } from 'react';
import { getAll, deactivate as deactivateCoupon } from '@/services/coupon.service';
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

  async function deactivate(id: string) {
    try {
      await deactivateCoupon(id);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to deactivate coupon');
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  return { coupons, isLoading, error, refetch, deactivate };
}
