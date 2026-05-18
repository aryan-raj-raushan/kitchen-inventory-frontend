import 'server-only';
import mongoose from 'mongoose';
import { InventoryItem, IInventoryItemDoc } from '../models/InventoryItem';
import type { CreateInventoryItemRequest } from '@/types';

export async function findAll(filters?: { status?: string }): Promise<IInventoryItemDoc[]> {
  const query: Record<string, unknown> = {};
  if (filters?.status) query.status = filters.status;
  return InventoryItem.find(query).populate('categoryId').sort({ name: 1 });
}

export async function findById(id: string): Promise<IInventoryItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return InventoryItem.findById(id);
}

export async function create(data: CreateInventoryItemRequest): Promise<IInventoryItemDoc> {
  return InventoryItem.create(data);
}

export async function update(
  id: string,
  data: Partial<CreateInventoryItemRequest & { currentQuantity: number }>
): Promise<IInventoryItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return InventoryItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deactivate(id: string): Promise<IInventoryItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return InventoryItem.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
}

export async function findByIds(ids: string[]): Promise<IInventoryItemDoc[]> {
  return InventoryItem.find({ _id: { $in: ids } });
}

export async function bulkDecrementQuantities(
  updates: Array<{ id: string; delta: number }>,
  session: mongoose.ClientSession
): Promise<void> {
  await Promise.all(
    updates.map(({ id, delta }) =>
      InventoryItem.findByIdAndUpdate(id, { $inc: { currentQuantity: delta } }, { session })
    )
  );
}

export async function resetToParLevel(session: mongoose.ClientSession): Promise<IInventoryItemDoc[]> {
  const items = await InventoryItem.find({ status: 'ACTIVE' }).session(session);
  await Promise.all(
    items.map((item) =>
      InventoryItem.findByIdAndUpdate(
        item._id,
        { $set: { currentQuantity: item.parLevel } },
        { session }
      )
    )
  );
  return items;
}
