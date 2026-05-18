import 'server-only';
import mongoose from 'mongoose';
import * as repo from '../repositories/combo.repository';
import { InventoryItem } from '../models/InventoryItem';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { CreateComboRequest, UpdateComboRequest } from '@/types';

async function resolveId(slugOrId: string): Promise<string> {
  if (mongoose.Types.ObjectId.isValid(slugOrId)) return slugOrId;
  const combo = await repo.findBySlug(slugOrId);
  if (!combo) throw new NotFoundError('Combo not found');
  return (combo._id as mongoose.Types.ObjectId).toString();
}

async function hydrateComponents(
  components: Array<{ inventoryItemId: string; quantity: number }>
): Promise<Array<{ inventoryItemId: string; itemName: string; quantity: number }>> {
  return Promise.all(
    components.map(async ({ inventoryItemId, quantity }) => {
      const item = await InventoryItem.findById(inventoryItemId);
      if (!item) throw new ValidationError(`Inventory item not found: ${inventoryItemId}`);
      return { inventoryItemId, itemName: item.name, quantity };
    })
  );
}

export async function getAll(filters?: { status?: string }) {
  return repo.findAll(filters);
}

export async function getActive() {
  return repo.findActive();
}

export async function getById(slugOrId: string) {
  const id = await resolveId(slugOrId);
  const combo = await repo.findById(id);
  if (!combo) throw new NotFoundError('Combo not found');
  return combo;
}

export async function create(dto: CreateComboRequest) {
  if (dto.components.length === 0) throw new ValidationError('Combo must have at least one component');
  const components = await hydrateComponents(dto.components);
  return repo.create({ ...dto, components });
}

export async function update(slugOrId: string, dto: UpdateComboRequest) {
  const id = await resolveId(slugOrId);
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Combo not found');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let components = (existing.components as unknown) as Array<{ inventoryItemId: string; itemName: string; quantity: number }>;
  if (dto.components) {
    if (dto.components.length === 0) throw new ValidationError('Combo must have at least one component');
    components = await hydrateComponents(dto.components);
  }

  const updated = await repo.update(id, { ...dto, components: dto.components ? components : undefined });
  if (!updated) throw new NotFoundError('Combo not found');
  return updated;
}

export async function remove(slugOrId: string) {
  const id = await resolveId(slugOrId);
  const combo = await repo.remove(id);
  if (!combo) throw new NotFoundError('Combo not found');
  return combo;
}
