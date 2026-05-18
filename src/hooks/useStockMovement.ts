'use client';

import { useState } from 'react';
import { toast } from 'sonner';
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
      toast.success(movementType === 'MANUAL_IN' ? 'Stock added' : 'Stock removed');
      onSuccess?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to record movement';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit, isSubmitting, error };
}
