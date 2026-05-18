'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/common/Button';
import type { IInvoiceTemplate, UpdateInvoiceTemplateRequest } from '@/types';

interface TemplateFormProps {
  template: IInvoiceTemplate | null;
  onSave: (data: UpdateInvoiceTemplateRequest) => void;
  isSaving: boolean;
}

export function TemplateForm({ template, onSave, isSaving }: TemplateFormProps) {
  const { register, handleSubmit, reset } = useForm<UpdateInvoiceTemplateRequest>();

  useEffect(() => {
    if (template) {
      reset({
        restaurantName: template.restaurantName,
        address: template.address ?? '',
        logoUrl: template.logoUrl ?? '',
        footerText: template.footerText ?? '',
        terms: template.terms ?? '',
        currencySymbol: template.currencySymbol,
      });
    }
  }, [template, reset]);

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {[
        { name: 'restaurantName', label: 'Restaurant Name', required: true },
        { name: 'currencySymbol', label: 'Currency Symbol', required: true, placeholder: '$' },
        { name: 'address', label: 'Address', required: false },
        { name: 'logoUrl', label: 'Logo URL', required: false, placeholder: 'https://…' },
        { name: 'footerText', label: 'Footer Text', required: false },
        { name: 'terms', label: 'Terms & Conditions', required: false },
      ].map(({ name, label, required, placeholder }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
          <input
            type="text"
            {...register(name as keyof UpdateInvoiceTemplateRequest, {
              required: required ? `${label} is required` : false,
            })}
            placeholder={placeholder}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}

      <Button type="submit" loading={isSaving}>
        Save Template
      </Button>
    </form>
  );
}
