'use client';

import { useState, useRef } from 'react';
import { validate } from '@/services/coupon.service';
import type { CouponValidationResult } from '@/types';

export function useCouponValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<CouponValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function validateCoupon(code: string, orderTotal: number) {
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!code.trim()) {
        setResult(null);
        return;
      }
      setIsValidating(true);
      try {
        const res = await validate(code, orderTotal);
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Validation failed');
        setResult(null);
      } finally {
        setIsValidating(false);
      }
    }, 400);
  }

  function clearValidation() {
    setResult(null);
    setError(null);
  }

  return { validateCoupon, clearValidation, isValidating, result, error };
}
