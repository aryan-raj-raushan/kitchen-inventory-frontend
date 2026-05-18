import 'server-only';
import mongoose, { Document, Schema, Types } from 'mongoose';
import type { ItemStatus } from '@/types';

export interface IMenuItemDoc extends Document {
  name: string;
  description?: string;
  categoryId: Types.ObjectId;
  price: number;
  inventoryItemId: Types.ObjectId;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItemDoc>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

MenuItemSchema.index({ inventoryItemId: 1 }, { unique: true });
MenuItemSchema.index({ status: 1 });

export const MenuItem =
  (mongoose.models.MenuItem as mongoose.Model<IMenuItemDoc>) ||
  mongoose.model<IMenuItemDoc>('MenuItem', MenuItemSchema);
