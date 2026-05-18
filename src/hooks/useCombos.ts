'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as comboService from '@/services/combo.service';
import type { ICombo } from '@/types';

export function useCombos() {
  const [combos, setCombos] = useState<ICombo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCombos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await comboService.getAll();
      setCombos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load combos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  async function deleteCombo(id: string) {
    try {
      await comboService.remove(id);
      setCombos((prev) => prev.filter((c) => c._id !== id));
      toast.success('Combo deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete combo');
    }
  }

  async function toggleStatus(combo: ICombo) {
    const newStatus = combo.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await comboService.update(combo._id, { status: newStatus });
      setCombos((prev) => prev.map((c) => (c._id === combo._id ? updated : c)));
      toast.success(`Combo ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update combo');
    }
  }

  return { combos, isLoading, error, refetch: fetchCombos, deleteCombo, toggleStatus };
}
