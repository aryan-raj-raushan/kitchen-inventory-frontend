'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import type { CouponValidationResult } from '@/types';

interface CouponInputProps {
  onApplyCoupon: (code: string) => void;
  isValidating: boolean;
  result: CouponValidationResult | null;
}

export function CouponInput({ onApplyCoupon, isValidating, result }: CouponInputProps) {
  const [code, setCode] = useState('');

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="COUPON CODE"
          className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          size="sm"
          variant="secondary"
          loading={isValidating}
          onClick={() => onApplyCoupon(code)}
          type="button"
        >
          Apply
        </Button>
      </div>
      {result && result.valid && (
        <p className="text-xs text-green-600">
          Coupon applied — saves ${result.discountAmount.toFixed(2)}
        </p>
      )}
      {result && !result.valid && (
        <p className="text-xs text-red-500">{result.reason ?? 'Invalid coupon'}</p>
      )}
    </div>
  );
}
