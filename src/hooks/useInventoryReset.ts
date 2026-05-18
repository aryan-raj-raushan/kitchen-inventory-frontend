'use client';

import { useState } from 'react';
import { triggerReset } from '@/services/inventory.service';

export function useInventoryReset(onSuccess?: () => void) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [result, setResult] = useState<{ resetCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function promptReset() {
    setShowConfirm(true);
  }

  function cancel() {
    setShowConfirm(false);
  }

  async function confirm() {
    setShowConfirm(false);
    setIsResetting(true);
    setError(null);
    try {
      const res = await triggerReset();
      setResult(res);
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setIsResetting(false);
    }
  }

  return { showConfirm, promptReset, cancel, confirm, isResetting, result, error };
}
