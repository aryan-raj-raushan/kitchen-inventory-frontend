import 'server-only';
import mongoose from 'mongoose';
import * as repo from '../repositories/inventory.repository';
import * as movementRepo from '../repositories/stockMovement.repository';
import { ValidationError, NotFoundError, ConflictError } from '@/lib/errors';
import type { CreateInventoryItemRequest, UpdateInventoryItemRequest, StockMovementRequest } from '@/types';

function validateImageUrl(imageUrl: string): void {
  if (imageUrl.startsWith('/uploads/')) return;
  try {
    new URL(imageUrl);
  } catch {
    throw new ValidationError('imageUrl must be a /uploads/ path or a valid URL');
  }
}

export async function getAll(filters?: { status?: string; categoryId?: string }) {
  return repo.findAll(filters);
}

export async function getById(id: string) {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError('Inventory item not found');
  return item;
}

export async function create(dto: CreateInventoryItemRequest) {
  if (dto.price < 0) throw new ValidationError('price must be >= 0');
  if (dto.imageUrl) validateImageUrl(dto.imageUrl);
  return repo.create(dto);
}

export async function update(id: string, dto: UpdateInventoryItemRequest) {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError('Inventory item not found');
  if (dto.price !== undefined && dto.price < 0) throw new ValidationError('price must be >= 0');
  if (dto.imageUrl) validateImageUrl(dto.imageUrl);
  const updated = await repo.update(id, dto);
  if (!updated) throw new NotFoundError('Inventory item not found');
  return updated;
}

export async function deactivate(id: string) {
  const item = await repo.deactivate(id);
  if (!item) throw new NotFoundError('Inventory item not found');
  return item;
}

export async function getAvailableForPOS(filters?: { categoryId?: string; search?: string }) {
  return repo.findAvailableForPOS(filters);
}

export async function recordManualMovement(id: string, dto: StockMovementRequest) {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError('Inventory item not found');

  if (dto.movementType === 'MANUAL_OUT') {
    if (item.currentQuantity < dto.quantityDelta) {
      throw new ConflictError(
        `Insufficient stock: have ${item.currentQuantity}, removing ${dto.quantityDelta}`
      );
    }
  }

  const delta = dto.movementType === 'MANUAL_IN' ? dto.quantityDelta : -dto.quantityDelta;
  await repo.update(id, { currentQuantity: item.currentQuantity + delta });
  await movementRepo.create({
    inventoryItemId: item._id as mongoose.Types.ObjectId,
    movementType: dto.movementType,
    quantityDelta: delta,
    notes: dto.notes,
    recordedBy: 'admin',
    recordedAt: new Date(),
  });

  return repo.findById(id);
}
