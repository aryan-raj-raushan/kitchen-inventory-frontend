'use client';

import { useState } from 'react';
import { create, update } from '@/services/inventory.service';
import type { CreateInventoryItemRequest } from '@/types';

export function useInventoryItem(existingId?: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(data: CreateInventoryItemRequest) {
    setIsSaving(true);
    setError(null);
    try {
      if (existingId) {
        await update(existingId, data);
      } else {
        await create(data);
      }
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save item');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { save, isSaving, error };
}
