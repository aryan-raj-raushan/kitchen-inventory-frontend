'use client';

import { useState, useEffect } from 'react';
import { getTemplate, updateTemplate } from '@/services/invoice.service';
import type { IInvoiceTemplate, UpdateInvoiceTemplateRequest } from '@/types';

export function useInvoiceTemplate() {
  const [template, setTemplate] = useState<IInvoiceTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    getTemplate()
      .then(setTemplate)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function save(data: UpdateInvoiceTemplateRequest) {
    setIsSaving(true);
    setError(null);
    setSavedOk(false);
    try {
      const updated = await updateTemplate(data);
      setTemplate(updated);
      setSavedOk(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  }

  return { template, isLoading, isSaving, error, savedOk, save };
}
