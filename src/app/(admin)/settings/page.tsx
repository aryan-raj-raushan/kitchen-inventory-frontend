'use client';

import { useInvoiceTemplate } from '@/hooks/useInvoiceTemplate';
import { TemplateForm } from '@/components/invoice/TemplateForm';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';

export default function SettingsPage() {
  const { template, isLoading, isSaving, error, savedOk, save } = useInvoiceTemplate();

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Invoice Template</h1>

      {error && <Alert variant="error" message={error} />}
      {savedOk && <Alert variant="success" message="Template saved successfully" />}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <TemplateForm template={template} onSave={save} isSaving={isSaving} />
        </div>
      )}
    </div>
  );
}
