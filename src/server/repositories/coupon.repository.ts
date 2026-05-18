import 'server-only';
import mongoose from 'mongoose';
import { Coupon, ICouponDoc } from '../models/Coupon';
import type { CreateCouponRequest } from '@/types';

export async function findAll(): Promise<ICouponDoc[]> {
  return Coupon.find().sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<ICouponDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Coupon.findById(id);
}

export async function findByCode(code: string): Promise<ICouponDoc | null> {
  return Coupon.findOne({ code: code.toUpperCase() });
}

export async function create(data: CreateCouponRequest): Promise<ICouponDoc> {
  // usesRemaining mirrors maxUses; 0 means unlimited so no decrement needed
  return Coupon.create({ ...data, usesRemaining: data.maxUses > 0 ? data.maxUses : 0 });
}

export async function update(
  id: string,
  data: Partial<CreateCouponRequest & { status: string }>
): Promise<ICouponDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Coupon.findByIdAndUpdate(id, data, { new: true });
}

export async function remove(id: string): Promise<ICouponDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Coupon.findByIdAndDelete(id);
}

export async function decrementUses(
  id: string | mongoose.Types.ObjectId,
  session: mongoose.ClientSession
): Promise<void> {
  await Coupon.findByIdAndUpdate(id, { $inc: { usesRemaining: -1 } }, { session });
}
