import 'server-only';
import mongoose, { Document, Schema, Types } from 'mongoose';
import type { StockStatus, ItemStatus } from '@/types';

export interface IInventoryItemDoc extends Document {
  name: string;
  categoryId: Types.ObjectId;
  unit: string;
  currentQuantity: number;
  minimumThreshold: number;
  criticalThreshold: number;
  parLevel: number;
  status: ItemStatus;
  stockStatus: StockStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItemDoc>(
  {
    name: { type: String, unique: true, required: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    unit: { type: String, required: true },
    currentQuantity: { type: Number, required: true, min: 0 },
    minimumThreshold: { type: Number, required: true },
    criticalThreshold: { type: Number, required: true },
    parLevel: { type: Number, required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ categoryId: 1 });

InventoryItemSchema.virtual('stockStatus').get(function (this: IInventoryItemDoc): StockStatus {
  if (this.currentQuantity === 0) return 'OUT_OF_STOCK';
  if (this.currentQuantity <= this.criticalThreshold) return 'CRITICAL';
  if (this.currentQuantity <= this.minimumThreshold) return 'LOW';
  return 'OK';
});

InventoryItemSchema.set('toJSON', { virtuals: true });
InventoryItemSchema.set('toObject', { virtuals: true });

export const InventoryItem =
  (mongoose.models.InventoryItem as mongoose.Model<IInventoryItemDoc>) ||
  mongoose.model<IInventoryItemDoc>('InventoryItem', InventoryItemSchema);
