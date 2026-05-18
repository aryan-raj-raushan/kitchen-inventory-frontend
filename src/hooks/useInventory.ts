'use client';

import { useState, useEffect } from 'react';
import { getAll, deactivate as deactivateItem } from '@/services/inventory.service';
import type { IInventoryItem, StockStatus } from '@/types';

function computeStockStatus(item: IInventoryItem): StockStatus {
  if (item.currentQuantity === 0) return 'OUT_OF_STOCK';
  if (item.currentQuantity <= item.criticalThreshold) return 'CRITICAL';
  if (item.currentQuantity <= item.minimumThreshold) return 'LOW';
  return 'OK';
}

export function useInventory() {
  const [items, setItems] = useState<Array<IInventoryItem & { stockStatus: StockStatus }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refetch() {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await getAll();
      setItems(raw.map((item) => ({ ...item, stockStatus: computeStockStatus(item) })));
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
  }, []);

  return { items, isLoading, error, refetch, deactivateItem: deactivate };
}
