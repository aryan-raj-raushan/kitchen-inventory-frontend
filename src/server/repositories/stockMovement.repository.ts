import 'server-only';
import mongoose from 'mongoose';
import { StockMovement, IStockMovementDoc } from '../models/StockMovement';
import type { MovementFilters } from '@/types';

export async function create(
  data: Partial<IStockMovementDoc>,
  session?: mongoose.ClientSession
): Promise<IStockMovementDoc> {
  const [movement] = await StockMovement.create([data], { session });
  return movement;
}

export async function findAll(
  filters: MovementFilters
): Promise<{ data: IStockMovementDoc[]; total: number }> {
  const { itemId, movementType, from, to, page = 1, limit = 20 } = filters;
  const query: Record<string, unknown> = {};

  if (itemId) query.inventoryItemId = new mongoose.Types.ObjectId(itemId);
  if (movementType) query.movementType = movementType;
  if (from || to) {
    query.recordedAt = {};
    if (from) (query.recordedAt as Record<string, unknown>).$gte = new Date(from);
    if (to) (query.recordedAt as Record<string, unknown>).$lte = new Date(to);
  }

  const [data, total] = await Promise.all([
    StockMovement.find(query)
      .populate('inventoryItemId', 'name')
      .sort({ recordedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    StockMovement.countDocuments(query),
  ]);

  return { data, total };
}

export async function exportAll(filters: Omit<MovementFilters, 'page' | 'limit'>): Promise<IStockMovementDoc[]> {
  const query: Record<string, unknown> = {};
  if (filters.itemId) query.inventoryItemId = new mongoose.Types.ObjectId(filters.itemId);
  if (filters.movementType) query.movementType = filters.movementType;
  if (filters.from || filters.to) {
    query.recordedAt = {};
    if (filters.from) (query.recordedAt as Record<string, unknown>).$gte = new Date(filters.from);
    if (filters.to) (query.recordedAt as Record<string, unknown>).$lte = new Date(filters.to);
  }
  return StockMovement.find(query).populate('inventoryItemId', 'name').sort({ recordedAt: -1 });
}
