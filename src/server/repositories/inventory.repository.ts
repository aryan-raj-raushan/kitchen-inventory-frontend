import 'server-only';
import mongoose from 'mongoose';
import { InventoryItem, IInventoryItemDoc } from '../models/InventoryItem';
import type { CreateInventoryItemRequest, UpdateInventoryItemRequest } from '@/types';

export async function findAll(filters?: {
  status?: string;
  categoryId?: string;
  dailyReset?: boolean;
}): Promise<IInventoryItemDoc[]> {
  const query: Record<string, unknown> = {};
  if (filters?.status) query.status = filters.status;
  if (filters?.categoryId) query.categoryId = filters.categoryId;
  if (filters?.dailyReset !== undefined) query.dailyReset = filters.dailyReset;
  return InventoryItem.find(query).populate('categoryId').sort({ name: 1 });
}

export async function findById(id: string): Promise<IInventoryItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return InventoryItem.findById(id).populate('categoryId');
}

export async function findBySlug(slug: string): Promise<IInventoryItemDoc | null> {
  return InventoryItem.findOne({ slug }).populate('categoryId');
}

export async function create(data: CreateInventoryItemRequest): Promise<IInventoryItemDoc> {
  return InventoryItem.create(data);
}

export async function update(
  id: string,
  data: UpdateInventoryItemRequest & { currentQuantity?: number }
): Promise<IInventoryItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return InventoryItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deactivate(id: string): Promise<IInventoryItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return InventoryItem.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
}

export async function remove(id: string): Promise<IInventoryItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return InventoryItem.findByIdAndDelete(id);
}

export async function findByIds(ids: string[]): Promise<IInventoryItemDoc[]> {
  return InventoryItem.find({ _id: { $in: ids } });
}

export async function findAvailableForPOS(filters?: {
  categoryId?: string;
  search?: string;
}): Promise<IInventoryItemDoc[]> {
  const query: Record<string, unknown> = {
    status: 'ACTIVE',
    currentQuantity: { $gt: 0 },
  };
  if (filters?.categoryId) query.categoryId = filters.categoryId;
  if (filters?.search) query.name = { $regex: filters.search, $options: 'i' };
  return InventoryItem.find(query).populate('categoryId').sort({ name: 1 });
}

export async function findDailyResetItems(): Promise<IInventoryItemDoc[]> {
  return InventoryItem.find({ status: 'ACTIVE', dailyReset: true });
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
