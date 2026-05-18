import 'server-only';
import mongoose, { Document, Schema, Types } from 'mongoose';
import type { MovementType } from '@/types';

export interface IStockMovementDoc extends Document {
  inventoryItemId: Types.ObjectId;
  movementType: MovementType;
  quantityDelta: number;
  orderId?: Types.ObjectId;
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

const StockMovementSchema = new Schema<IStockMovementDoc>({
  inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  movementType: {
    type: String,
    enum: ['MANUAL_IN', 'MANUAL_OUT', 'ORDER_DEDUCTION', 'DAILY_RESET'],
    required: true,
  },
  quantityDelta: { type: Number, required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  notes: String,
  recordedBy: { type: String, default: 'admin' },
  recordedAt: { type: Date, default: Date.now },
});

StockMovementSchema.index({ inventoryItemId: 1, recordedAt: -1 });
StockMovementSchema.index({ movementType: 1, recordedAt: -1 });
StockMovementSchema.index({ orderId: 1 });

export const StockMovement =
  (mongoose.models.StockMovement as mongoose.Model<IStockMovementDoc>) ||
  mongoose.model<IStockMovementDoc>('StockMovement', StockMovementSchema);
