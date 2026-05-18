import { gateway } from '@/lib/gateway';
import type { ICombo, CreateComboRequest, UpdateComboRequest } from '@/types';

export async function getAll(): Promise<ICombo[]> {
  return gateway.get<ICombo[]>('/admin/combos');
}

export async function getById(slugOrId: string): Promise<ICombo> {
  return gateway.get<ICombo>(`/admin/combos/${slugOrId}`);
}

export async function create(data: CreateComboRequest): Promise<ICombo> {
  return gateway.post<ICombo>('/admin/combos', data);
}

export async function update(slugOrId: string, data: UpdateComboRequest): Promise<ICombo> {
  return gateway.patch<ICombo>(`/admin/combos/${slugOrId}`, data);
}

export async function remove(slugOrId: string): Promise<void> {
  await gateway.delete(`/admin/combos/${slugOrId}`);
}
