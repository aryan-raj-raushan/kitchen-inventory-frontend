'use client';

import { useState, useEffect } from 'react';
import { getAll, deactivate as deactivateItem } from '@/services/inventory.service';
import type { IInventoryItem } from '@/types';

export function useInventory(params?: { status?: string; category?: string }) {
  const [items, setItems] = useState<IInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refetch() {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await getAll(params);
      setItems(raw);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  }

  async function deactivate(id: string) {
    try {
      await deactivateItem(id);
      await refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to deactivate item');
    }
  }

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, isLoading, error, refetch, deactivate };
}
