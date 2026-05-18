'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCouponForm } from '@/hooks/useCouponForm';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import type { CreateCouponRequest, DiscountType } from '@/types';

export default function NewCouponPage() {
  const router = useRouter();
  const { save, isSaving, error } = useCouponForm();
  const { register, handleSubmit, watch } = useForm<CreateCouponRequest>();
  const discountType = watch('discountType', 'PERCENTAGE') as DiscountType;

  async function onSubmit(data: CreateCouponRequest) {
    const ok = await save({
      ...data,
      discountValue: Number(data.discountValue),
      maxUses: Number(data.maxUses),
    });
    if (ok) router.push('/coupons');
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Create Coupon</h1>

      {error && <Alert variant="error" message={error} />}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Coupon Code</label>
          <input
            type="text"
            {...register('code', { required: true })}
            placeholder="SAVE10"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Discount Type</label>
          <div className="flex gap-4">
            {(['PERCENTAGE', 'FIXED_AMOUNT'] as const).map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" {...register('discountType')} value={t} className="accent-blue-600" />
                <span className="text-sm">{t === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount ($)'}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount ($)'}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max={discountType === 'PERCENTAGE' ? '100' : undefined}
            {...register('discountValue', { required: true })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses</label>
          <input
            type="number"
            min="1"
            {...register('maxUses', { required: true })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
          <input
            type="date"
            {...register('expiryDate', { required: true })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSaving}>Create Coupon</Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/coupons')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
