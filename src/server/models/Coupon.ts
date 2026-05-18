import 'server-only';
import mongoose, { Document, Schema } from 'mongoose';
import type { DiscountType, CouponStatus } from '@/types';

export interface ICouponDoc extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: Date;
  maxUses: number;
  usesRemaining: number;
  expiryDate: Date;
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICouponDoc>(
  {
    code: { type: String, unique: true, required: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    maxUses: { type: Number, required: true, min: 0 },
    usesRemaining: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ['ACTIVE', 'DEACTIVATED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

CouponSchema.index({ status: 1, startDate: 1, expiryDate: 1 });

export const Coupon =
  (mongoose.models.Coupon as mongoose.Model<ICouponDoc>) ||
  mongoose.model<ICouponDoc>('Coupon', CouponSchema);
