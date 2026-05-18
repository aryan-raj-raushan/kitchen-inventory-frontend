'use client';

import { useState } from 'react';
import { recordMovement } from '@/services/inventory.service';

export function useStockMovement(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    itemId: string,
    movementType: 'MANUAL_IN' | 'MANUAL_OUT',
    quantityDelta: number,
    notes?: string
  ) {
    setIsSubmitting(true);
    setError(null);
    try {
      await recordMovement(itemId, { movementType, quantityDelta, notes });
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record movement');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting, error };
}
