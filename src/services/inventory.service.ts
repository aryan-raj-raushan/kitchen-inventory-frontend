import { gateway } from '@/lib/gateway';
import type {
  IInventoryItem,
  IStockMovement,
  CreateInventoryItemRequest,
  StockMovementRequest,
  MovementFilters,
  PaginatedResponse,
} from '@/types';

export async function getAll(): Promise<IInventoryItem[]> {
  return gateway.get<IInventoryItem[]>('/admin/inventory');
}

export async function create(data: CreateInventoryItemRequest): Promise<IInventoryItem> {
  return gateway.post<IInventoryItem>('/admin/inventory', data);
}

export async function update(id: string, data: Partial<CreateInventoryItemRequest>): Promise<IInventoryItem> {
  return gateway.put<IInventoryItem>(`/admin/inventory/${id}`, data);
}

export async function deactivate(id: string): Promise<IInventoryItem> {
  return gateway.put<IInventoryItem>(`/admin/inventory/${id}`, { status: 'INACTIVE' });
}

export async function recordMovement(id: string, data: StockMovementRequest): Promise<IInventoryItem> {
  return gateway.post<IInventoryItem>(`/admin/inventory/${id}/movements`, data);
}

export async function triggerReset(): Promise<{ resetCount: number }> {
  return gateway.post<{ resetCount: number }>('/admin/inventory/reset', { confirm: true });
}

export async function getMovements(
  filters: MovementFilters
): Promise<{ data: IStockMovement[]; total: number }> {
  const params = new URLSearchParams();
  if (filters.itemId) params.set('itemId', filters.itemId);
  if (filters.movementType) params.set('movementType', filters.movementType);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const query = params.toString() ? `?${params}` : '';
  return gateway.get<{ data: IStockMovement[]; total: number }>(`/admin/inventory/movements${query}`);
}

export async function exportMovements(
  filters: Omit<MovementFilters, 'page' | 'limit'>,
  format: 'csv' | 'pdf'
): Promise<Blob> {
  const params = new URLSearchParams({ format });
  if (filters.itemId) params.set('itemId', filters.itemId);
  if (filters.movementType) params.set('movementType', filters.movementType);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);

  const { useAuthStore } = await import('@/store/authStore');
  const { accessToken } = useAuthStore.getState();

  const res = await fetch(`/api/v1/admin/inventory/movements/export?${params}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}
