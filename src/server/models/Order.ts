import 'server-only';
import mongoose, { Document, Schema, Types } from 'mongoose';
import type { OrderStatus } from '@/types';

export interface IOrderItemDoc {
  menuItemId: Types.ObjectId;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IOrderDoc extends Document {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  couponId?: Types.ObjectId;
  items: IOrderItemDoc[];
  subtotal: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItemDoc>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    menuItemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDoc>(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });

export const Order =
  (mongoose.models.Order as mongoose.Model<IOrderDoc>) ||
  mongoose.model<IOrderDoc>('Order', OrderSchema);
