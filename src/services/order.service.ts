import { gateway } from '@/lib/gateway';
import type { IOrder, CreateOrderRequest, PaginatedResponse } from '@/types';

export async function createOrder(payload: CreateOrderRequest): Promise<IOrder> {
  return gateway.post<IOrder>('/admin/orders', payload);
}

export async function getOrders(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: IOrder[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const query = params.toString() ? `?${params}` : '';
  return gateway.get<{ orders: IOrder[]; total: number }>(`/admin/orders${query}`);
}

export async function getOrder(id: string): Promise<IOrder> {
  return gateway.get<IOrder>(`/admin/orders/${id}`);
}

export async function cancelOrder(id: string): Promise<IOrder> {
  return gateway.delete<IOrder>(`/admin/orders/${id}`);
}
