'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ICoupon, CreateCouponRequest } from '@/types';

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required');

const schema = z.object({
  code: z.string().min(1, 'Required'),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.coerce.number().min(0, 'Must be ≥ 0'),
  startDate: dateStr,
  expiryDate: dateStr,
  maxUses: z.coerce.number().int().min(0, 'Must be ≥ 0'),
});

type FormValues = z.infer<typeof schema>;

interface CouponFormProps {
  initial?: ICoupon;
  onSubmit: (data: CreateCouponRequest) => Promise<void>;
  isSaving: boolean;
  error: string | null;
  onCancel: () => void;
}

function toDateInput(iso?: string) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function CouponForm({ initial, onSubmit, isSaving, error, onCancel }: CouponFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: initial
      ? {
          code: initial.code,
          discountType: initial.discountType,
          discountValue: initial.discountValue,
          startDate: toDateInput(initial.startDate),
          expiryDate: toDateInput(initial.expiryDate),
          maxUses: initial.maxUses,
        }
      : { discountType: 'PERCENTAGE', maxUses: 0 },
  });

  const discountType = watch('discountType');

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
  const errClass = 'text-xs text-red-500 mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Coupon Code</label>
        <input
          {...register('code')}
          disabled={!!initial}
          placeholder="SAVE10"
          className={`${inputClass} uppercase ${initial ? 'bg-slate-50 text-slate-500' : ''}`}
        />
        {errors.code && <p className={errClass}>{errors.code.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Discount Type</label>
        <div className="flex flex-wrap gap-4">
          {(['PERCENTAGE', 'FIXED_AMOUNT'] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" {...register('discountType')} value={t} className="accent-indigo-600" />
              {t === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>
          {discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount (₹)'}
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max={discountType === 'PERCENTAGE' ? '100' : undefined}
          {...register('discountValue')}
          className={inputClass}
        />
        {errors.discountValue && <p className={errClass}>{errors.discountValue.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input type="date" {...register('startDate')} className={inputClass} />
          {errors.startDate && <p className={errClass}>{errors.startDate.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Expiry Date</label>
          <input type="date" {...register('expiryDate')} className={inputClass} />
          {errors.expiryDate && <p className={errClass}>{errors.expiryDate.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Max Uses <span className="text-slate-400 font-normal">(0 = unlimited)</span></label>
        <input type="number" min="0" {...register('maxUses')} className={inputClass} />
        {errors.maxUses && <p className={errClass}>{errors.maxUses.message}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Saving…' : initial ? 'Save Changes' : 'Create Coupon'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
