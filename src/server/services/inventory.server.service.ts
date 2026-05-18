import 'server-only';
import mongoose from 'mongoose';
import * as repo from '../repositories/inventory.repository';
import * as movementRepo from '../repositories/stockMovement.repository';
import { ValidationError, NotFoundError, ConflictError } from '@/lib/errors';
import type { CreateInventoryItemRequest, StockMovementRequest } from '@/types';

export async function getAll(filters?: { status?: string }) {
  return repo.findAll(filters);
}

export async function create(dto: CreateInventoryItemRequest) {
  if (dto.criticalThreshold >= dto.minimumThreshold) {
    throw new ValidationError(
      'Critical threshold must be less than minimum threshold'
    );
  }
  return repo.create(dto);
}

export async function update(id: string, dto: Partial<CreateInventoryItemRequest>) {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError('Inventory item not found');

  const critical = dto.criticalThreshold ?? item.criticalThreshold;
  const minimum = dto.minimumThreshold ?? item.minimumThreshold;
  if (critical >= minimum) {
    throw new ValidationError('Critical threshold must be less than minimum threshold');
  }

  const updated = await repo.update(id, dto);
  if (!updated) throw new NotFoundError('Inventory item not found');
  return updated;
}

export async function deactivate(id: string) {
  const item = await repo.deactivate(id);
  if (!item) throw new NotFoundError('Inventory item not found');
  return item;
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

export async function dailyReset() {
  const session = await mongoose.startSession();
  const movements: Array<{
    inventoryItemId: mongoose.Types.ObjectId;
    movementType: 'DAILY_RESET';
    quantityDelta: number;
    notes: string;
    recordedBy: string;
    recordedAt: Date;
  }> = [];

  try {
    await session.withTransaction(async () => {
      const items = await repo.resetToParLevel(session);
      for (const item of items) {
        movements.push({
          inventoryItemId: item._id as mongoose.Types.ObjectId,
          movementType: 'DAILY_RESET',
          quantityDelta: item.parLevel - item.currentQuantity,
          notes: `Daily reset to par level ${item.parLevel}`,
          recordedBy: 'admin',
          recordedAt: new Date(),
        });
      }
    });

    for (const m of movements) {
      await movementRepo.create(m);
    }

    return { resetCount: movements.length };
  } finally {
    session.endSession();
  }
}
