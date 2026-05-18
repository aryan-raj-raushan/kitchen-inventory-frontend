import 'server-only';
import mongoose, { Document, Schema, Types } from 'mongoose';
import { slugify } from '@/lib/slugify';
import type { StockStatus, ItemStatus } from '@/types';

export interface IInventoryItemDoc extends Document {
  name: string;
  slug: string;
  categoryId: Types.ObjectId;
  unit: string;
  price: number;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
  discountValue?: number;
  currentQuantity: number;
  dailyReset: boolean;
  imageUrl?: string;
  status: ItemStatus;
  stockStatus: StockStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItemDoc>(
  {
    name: { type: String, unique: true, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], default: null },
    discountValue: { type: Number, min: 0, default: 0 },
    currentQuantity: { type: Number, required: true, min: 0 },
    dailyReset: { type: Boolean, default: false },
    imageUrl: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ status: 1 });
InventoryItemSchema.index({ categoryId: 1 });
InventoryItemSchema.index({ dailyReset: 1 });

InventoryItemSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    const base = slugify(this.name);
    let candidate = base;
    let suffix = 1;
    while (await (this.constructor as mongoose.Model<IInventoryItemDoc>).findOne({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${suffix++}`;
    }
    this.slug = candidate;
  }
});

InventoryItemSchema.virtual('stockStatus').get(function (this: IInventoryItemDoc): StockStatus {
  return this.currentQuantity === 0 ? 'OUT_OF_STOCK' : 'OK';
});

InventoryItemSchema.set('toJSON', { virtuals: true });
InventoryItemSchema.set('toObject', { virtuals: true });

export const InventoryItem =
  (mongoose.models.InventoryItem as mongoose.Model<IInventoryItemDoc>) ||
  mongoose.model<IInventoryItemDoc>('InventoryItem', InventoryItemSchema);
