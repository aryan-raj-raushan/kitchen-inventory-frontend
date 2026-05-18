import { gateway } from '@/lib/gateway';
import type { IMenuItem, CreateMenuItemRequest } from '@/types';

export async function getMenu(): Promise<IMenuItem[]> {
  return gateway.get<IMenuItem[]>('/menu');
}

export async function adminGetMenuItems(): Promise<IMenuItem[]> {
  return gateway.get<IMenuItem[]>('/admin/menu-items');
}

export async function createMenuItem(data: CreateMenuItemRequest): Promise<IMenuItem> {
  return gateway.post<IMenuItem>('/admin/menu-items', data);
}

export async function updateMenuItem(
  id: string,
  data: Partial<CreateMenuItemRequest>
): Promise<IMenuItem> {
  return gateway.put<IMenuItem>(`/admin/menu-items/${id}`, data);
}

export async function deactivateMenuItem(id: string): Promise<IMenuItem> {
  return gateway.delete<IMenuItem>(`/admin/menu-items/${id}`);
}
