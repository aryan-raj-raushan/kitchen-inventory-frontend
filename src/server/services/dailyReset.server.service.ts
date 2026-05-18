import 'server-only';
import * as resetRepo from '../repositories/dailyReset.repository';
import * as inventoryRepo from '../repositories/inventory.repository';
import { ValidationError, NotFoundError } from '@/lib/errors';

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export async function checkAndTriggerReset(): Promise<{
  resetDate: string;
  pendingItems: Array<{ _id: string; name: string; unit: string; imageUrl?: string; resetDate: string }>;
}> {
  const dateStr = todayDateStr();
  const resetItems = await inventoryRepo.findDailyResetItems();

  for (const item of resetItems) {
    const existing = await resetRepo.findByItemAndDate(String(item._id), dateStr);
    if (!existing) {
      const prevQty = item.currentQuantity;
      await inventoryRepo.update(String(item._id), { currentQuantity: 0 });
      await resetRepo.createResetEntry(item._id, dateStr, prevQty);
    }
  }

  const pending = await resetRepo.findPendingForDate(dateStr);
  const pendingIds = new Set(pending.map((p) => String(p.inventoryItemId)));
  const pendingItems = resetItems
    .filter((item) => pendingIds.has(String(item._id)))
    .map((item) => ({
      _id: String(item._id),
      name: item.name,
      unit: item.unit,
      imageUrl: item.imageUrl,
      resetDate: dateStr,
    }));

  return { resetDate: dateStr, pendingItems };
}

export async function confirmDailyQuantity(
  itemId: string,
  qty: number
): Promise<{ _id: string; name: string; currentQuantity: number; stockStatus: string }> {
  if (qty < 0) throw new ValidationError('quantity must be >= 0');

  const dateStr = todayDateStr();
  const log = await resetRepo.findByItemAndDate(itemId, dateStr);
  if (!log) throw new NotFoundError('No reset log found for this item today');

  await inventoryRepo.update(itemId, { currentQuantity: qty });
  await resetRepo.confirmReset(String(log._id), qty, new Date());

  const item = await inventoryRepo.findById(itemId);
  if (!item) throw new NotFoundError('Inventory item not found');

  return {
    _id: String(item._id),
    name: item.name,
    currentQuantity: item.currentQuantity,
    stockStatus: item.currentQuantity === 0 ? 'OUT_OF_STOCK' : 'OK',
  };
}
