import 'server-only';
import * as repo from '../repositories/coupon.repository';
import { ConflictError, NotFoundError } from '@/lib/errors';
import type { CreateCouponRequest, CouponValidationResult } from '@/types';

export async function getAll() {
  return repo.findAll();
}

export async function create(dto: CreateCouponRequest) {
  const existing = await repo.findByCode(dto.code);
  if (existing) throw new ConflictError(`Coupon code "${dto.code}" already exists`);
  return repo.create({ ...dto, code: dto.code.toUpperCase() });
}

export async function update(id: string, dto: Partial<CreateCouponRequest>) {
  const coupon = await repo.update(id, dto);
  if (!coupon) throw new NotFoundError('Coupon not found');
  return coupon;
}

export async function deactivate(id: string) {
  const coupon = await repo.deactivate(id);
  if (!coupon) throw new NotFoundError('Coupon not found');
  return coupon;
}

export async function validate(
  code: string,
  orderTotal: number
): Promise<CouponValidationResult> {
  const coupon = await repo.findByCode(code);

  if (!coupon) {
    return { valid: false, reason: 'Coupon not found', discountAmount: 0, newTotal: orderTotal };
  }
  if (coupon.status !== 'ACTIVE') {
    return { valid: false, reason: 'Coupon is inactive', discountAmount: 0, newTotal: orderTotal };
  }
  if (coupon.usesRemaining <= 0) {
    return { valid: false, reason: 'Coupon has no uses remaining', discountAmount: 0, newTotal: orderTotal };
  }
  if (new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, reason: 'Coupon has expired', discountAmount: 0, newTotal: orderTotal };
  }

  let discountAmount: number;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = orderTotal * (coupon.discountValue / 100);
  } else {
    discountAmount = Math.min(coupon.discountValue, orderTotal);
  }

  const newTotal = Math.max(0, orderTotal - discountAmount);

  return {
    valid: true,
    coupon: {
      _id: coupon._id.toString(),
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      usesRemaining: coupon.usesRemaining,
      expiryDate: coupon.expiryDate.toISOString(),
      status: coupon.status,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString(),
    },
    discountAmount,
    newTotal,
  };
}
