import 'server-only';
import * as repo from '../repositories/menuItem.repository';
import { ConflictError, NotFoundError } from '@/lib/errors';
import type { CreateMenuItemRequest } from '@/types';
import { MenuItem } from '../models/MenuItem';

export async function getAll() {
  return repo.findAll();
}

export async function create(data: CreateMenuItemRequest) {
  const existing = await MenuItem.findOne({ inventoryItemId: data.inventoryItemId });
  if (existing) {
    throw new ConflictError('This inventory item is already linked to a menu item');
  }
  return repo.create(data);
}

export async function update(id: string, data: Partial<CreateMenuItemRequest>) {
  const item = await repo.update(id, data);
  if (!item) throw new NotFoundError('Menu item not found');
  return item;
}

export async function deactivate(id: string) {
  const item = await repo.deactivate(id);
  if (!item) throw new NotFoundError('Menu item not found');
  return item;
}
