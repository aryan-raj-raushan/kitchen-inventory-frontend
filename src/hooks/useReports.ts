'use client';

import { useState, useEffect } from 'react';
import { getMovements, exportMovements } from '@/services/inventory.service';
import type { IStockMovement, MovementFilters, MovementType } from '@/types';

export function useReports() {
  const [movements, setMovements] = useState<IStockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<MovementFilters>({ page: 1, limit: 20 });

  async function fetchMovements(newFilters?: MovementFilters) {
    const activeFilters = newFilters ?? filters;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMovements(activeFilters);
      setMovements(res.data);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load movements');
    } finally {
      setIsLoading(false);
    }
  }

  async function exportReport(format: 'csv' | 'pdf') {
    setIsExporting(true);
    try {
      const blob = await exportMovements(
        { itemId: filters.itemId, movementType: filters.movementType, from: filters.from, to: filters.to },
        format
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock-movements-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }

  function updateFilter(update: Partial<MovementFilters>) {
    const next = { ...filters, ...update, page: 1 };
    setFilters(next);
    fetchMovements(next);
  }

  function setPage(page: number) {
    const next = { ...filters, page };
    setFilters(next);
    fetchMovements(next);
  }

  useEffect(() => {
    fetchMovements();
  }, []);

  return {
    movements,
    total,
    filters,
    isLoading,
    isExporting,
    error,
    updateFilter,
    setPage,
    exportReport,
  };
}
