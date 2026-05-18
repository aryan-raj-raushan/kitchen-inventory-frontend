'use client';

import { type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const templateSchema = z.object({
  restaurantName: z.string().min(1, 'Required'),
  address: z.string().optional(),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  footerText: z.string().optional(),
  terms: z.string().optional(),
  currencySymbol: z.string().min(1, 'Required').max(3),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  form: UseFormReturn<TemplateFormValues>;
  onSave: (data: TemplateFormValues) => void;
  isSaving: boolean;
}

export function TemplateForm({ form, onSave, isSaving }: TemplateFormProps) {
  const { register, handleSubmit, formState: { errors } } = form;

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
  const errClass = 'text-xs text-red-500 mt-1';

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div>
        <label className={labelClass}>Restaurant Name</label>
        <input {...register('restaurantName')} className={inputClass} placeholder="My Restaurant" />
        {errors.restaurantName && <p className={errClass}>{errors.restaurantName.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Currency Symbol</label>
        <input {...register('currencySymbol')} className={inputClass} placeholder="₹" />
        {errors.currencySymbol && <p className={errClass}>{errors.currencySymbol.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Address</label>
        <input {...register('address')} className={inputClass} placeholder="123 Main Street, City" />
      </div>

      <div>
        <label className={labelClass}>
          Logo URL <span className="text-slate-400 font-normal">(https://…)</span>
        </label>
        <input
          {...register('logoUrl')}
          className={inputClass}
          placeholder="https://example.com/logo.png"
        />
        {errors.logoUrl && <p className={errClass}>{errors.logoUrl.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Footer Text</label>
        <input
          {...register('footerText')}
          className={inputClass}
          placeholder="Thank you for your visit!"
        />
      </div>

      <div>
        <label className={labelClass}>Terms &amp; Conditions</label>
        <textarea
          {...register('terms')}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="All sales are final…"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isSaving ? 'Saving…' : 'Save Template'}
      </button>
    </form>
  );
}
