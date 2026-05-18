import { gateway } from '@/lib/gateway';
import type {
  IInventoryItem,
  IStockMovement,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  StockMovementRequest,
  MovementFilters,
  ImageUploadResponse,
} from '@/types';
import { useAuthStore } from '@/store/authStore';

export async function getAll(params?: { status?: string; category?: string }): Promise<IInventoryItem[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.category) qs.set('category', params.category);
  const query = qs.toString() ? `?${qs}` : '';
  return gateway.get<IInventoryItem[]>(`/admin/inventory${query}`);
}

export async function getById(id: string): Promise<IInventoryItem> {
  return gateway.get<IInventoryItem>(`/admin/inventory/${id}`);
}

export async function create(data: CreateInventoryItemRequest): Promise<IInventoryItem> {
  return gateway.post<IInventoryItem>('/admin/inventory', data);
}

export async function update(id: string, data: UpdateInventoryItemRequest): Promise<IInventoryItem> {
  return gateway.patch<IInventoryItem>(`/admin/inventory/${id}`, data);
}

export async function deactivate(id: string): Promise<IInventoryItem> {
  return gateway.put<IInventoryItem>(`/admin/inventory/${id}`);
}

export async function remove(id: string): Promise<void> {
  await gateway.delete(`/admin/inventory/${id}`);
}

export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const { accessToken } = useAuthStore.getState();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/v1/admin/inventory/image', {
    method: 'POST',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Upload failed');
  }
  return res.json();
}

export async function recordMovement(id: string, data: StockMovementRequest): Promise<IInventoryItem> {
  return gateway.post<IInventoryItem>(`/admin/inventory/${id}/movements`, data);
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

  const { accessToken } = useAuthStore.getState();
  const res = await fetch(`/api/v1/admin/inventory/movements/export?${params}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
}
