'use client';

import { useState } from 'react';
import type { CouponValidationResult } from '@/types';

interface CouponInputProps {
  onApplyCoupon: (code: string) => void;
  isValidating: boolean;
  result: CouponValidationResult | null;
  currencySymbol?: string;
}

export function CouponInput({ onApplyCoupon, isValidating, result, currencySymbol = '₹' }: CouponInputProps) {
  const [code, setCode] = useState('');

  function handleApply() {
    const trimmed = code.trim();
    if (!trimmed) return;
    onApplyCoupon(trimmed);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="COUPON CODE"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          disabled={isValidating || !code.trim()}
          onClick={handleApply}
          className="px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          {isValidating ? '…' : 'Apply'}
        </button>
      </div>
      {result?.valid && (
        <p className="text-xs text-emerald-600 font-medium">
          ✓ Coupon applied — saves {currencySymbol}{result.discountAmount.toFixed(2)}
        </p>
      )}
      {result && !result.valid && (
        <p className="text-xs text-red-500">✕ {result.reason ?? 'Invalid coupon'}</p>
      )}
    </div>
  );
}
