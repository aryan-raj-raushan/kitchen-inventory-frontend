'use client';

import { useState } from 'react';
import { create, update } from '@/services/coupon.service';
import type { CreateCouponRequest } from '@/types';

export function useCouponForm(existingId?: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(data: CreateCouponRequest) {
    if (data.discountType === 'PERCENTAGE' && (data.discountValue < 0 || data.discountValue > 100)) {
      setError('Percentage discount must be between 0 and 100');
      return false;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (existingId) {
        await update(existingId, data);
      } else {
        await create(data);
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save coupon');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { save, isSaving, error };
}
