'use client';

import { useState, useEffect } from 'react';
import { getOrders, cancelOrder } from '@/services/order.service';
import { downloadInvoice } from '@/services/invoice.service';
import type { IOrder } from '@/types';

export function useOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrders(filters?: { status?: string; page?: number }) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getOrders({ ...filters, limit: 20 });
      setOrders(res.orders);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }

  async function cancel(id: string) {
    try {
      await cancelOrder(id);
      await fetchOrders({ page });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel order');
    }
  }

  async function handleDownloadInvoice(orderId: string) {
    try {
      await downloadInvoice(orderId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to download invoice');
    }
  }

  useEffect(() => {
    fetchOrders({ page });
  }, [page]);

  return {
    orders,
    total,
    page,
    setPage,
    isLoading,
    error,
    fetchOrders,
    cancelOrder: cancel,
    downloadInvoice: handleDownloadInvoice,
  };
}
