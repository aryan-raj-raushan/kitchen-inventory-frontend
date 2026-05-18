'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Tag } from 'lucide-react';
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
        <div className="relative flex-1">
          <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="COUPON CODE"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
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
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <CheckCircle2 size={12} />
          Coupon applied — saves {currencySymbol}{result.discountAmount.toFixed(2)}
        </p>
      )}
      {result && !result.valid && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <XCircle size={12} />
          {result.reason ?? 'Invalid coupon'}
        </p>
      )}
    </div>
  );
}
