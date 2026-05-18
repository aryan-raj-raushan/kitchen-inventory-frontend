'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInvoiceTemplate } from '@/hooks/useInvoiceTemplate';
import { TemplateForm, templateSchema, type TemplateFormValues } from '@/components/invoice/TemplateForm';
import { InvoicePreview } from '@/components/invoice/InvoicePreview';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { IInvoiceTemplate } from '@/types';

export default function SettingsPage() {
  const { template, isLoading, isSaving, error, savedOk, save } = useInvoiceTemplate();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      restaurantName: '',
      address: '',
      logoUrl: '',
      footerText: '',
      terms: '',
      currencySymbol: '₹',
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        restaurantName: template.restaurantName,
        address: template.address ?? '',
        logoUrl: template.logoUrl ?? '',
        footerText: template.footerText ?? '',
        terms: template.terms ?? '',
        currencySymbol: template.currencySymbol,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  // Reactive read in render — no effect, no loop
  const watched = form.watch();

  const liveTemplate: IInvoiceTemplate | null = template
    ? { ...template, ...watched }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 flex-shrink-0">Invoice Settings</h1>

      {error && <Alert variant="error" message={error} />}
      {savedOk && <Alert variant="success" message="Template saved successfully" />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-1/2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-5">Template Settings</h2>
            <TemplateForm form={form} onSave={save} isSaving={isSaving} />
          </div>

          <div className="w-full lg:w-1/2 lg:sticky lg:top-6">
            <h2 className="font-semibold text-slate-800 mb-3">Live Preview</h2>
            <InvoicePreview template={liveTemplate} />
          </div>
        </div>
      )}
    </div>
  );
}
