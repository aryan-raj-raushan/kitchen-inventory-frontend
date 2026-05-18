'use client';

import { useState, useEffect } from 'react';
import { gateway } from '@/lib/gateway';

interface PendingItem {
  _id: string;
  name: string;
  unit: string;
  imageUrl?: string;
  resetDate: string;
}

interface DailyResetStatus {
  resetDate: string;
  pendingItems: PendingItem[];
}

export function useDailyReset() {
  const [status, setStatus] = useState<DailyResetStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPendingResets() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gateway.get<DailyResetStatus>('/admin/inventory/daily-reset');
      setStatus(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check daily reset');
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmQuantity(itemId: string, quantity: number) {
    await gateway.post(`/admin/inventory/daily-reset/${itemId}`, { quantity });
    await fetchPendingResets();
  }

  useEffect(() => {
    fetchPendingResets();
  }, []);

  return {
    pendingItems: status?.pendingItems ?? [],
    resetDate: status?.resetDate ?? '',
    isLoading,
    error,
    confirmQuantity,
    refetch: fetchPendingResets,
  };
}
