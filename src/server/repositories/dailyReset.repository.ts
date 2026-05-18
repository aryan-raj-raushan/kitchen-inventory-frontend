import 'server-only';
import mongoose from 'mongoose';
import { DailyResetLog, IDailyResetLogDoc } from '../models/DailyResetLog';

export async function findByItemAndDate(
  itemId: string,
  dateStr: string
): Promise<IDailyResetLogDoc | null> {
  return DailyResetLog.findOne({ inventoryItemId: itemId, resetDate: dateStr });
}

export async function createResetEntry(
  itemId: string | mongoose.Types.ObjectId,
  dateStr: string,
  prevQty: number
): Promise<IDailyResetLogDoc> {
  return DailyResetLog.create({
    inventoryItemId: itemId,
    resetDate: dateStr,
    quantityBeforeReset: prevQty,
  });
}

export async function confirmReset(
  logId: string,
  qty: number,
  at: Date
): Promise<IDailyResetLogDoc | null> {
  return DailyResetLog.findByIdAndUpdate(
    logId,
    { confirmedQuantity: qty, confirmedAt: at },
    { new: true }
  );
}

export async function findPendingForDate(dateStr: string): Promise<IDailyResetLogDoc[]> {
  return DailyResetLog.find({ resetDate: dateStr, confirmedQuantity: { $exists: false } });
}
