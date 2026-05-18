import { gateway } from '@/lib/gateway';
import type { ICoupon, CreateCouponRequest, UpdateCouponRequest, CouponValidationResult } from '@/types';

export async function getAll(): Promise<ICoupon[]> {
  return gateway.get<ICoupon[]>('/admin/coupons');
}

export async function getById(id: string): Promise<ICoupon> {
  return gateway.get<ICoupon>(`/admin/coupons/${id}`);
}

export async function create(data: CreateCouponRequest): Promise<ICoupon> {
  return gateway.post<ICoupon>('/admin/coupons', data);
}

export async function update(id: string, data: UpdateCouponRequest): Promise<ICoupon> {
  return gateway.patch<ICoupon>(`/admin/coupons/${id}`, data);
}

export async function remove(id: string): Promise<void> {
  await gateway.delete(`/admin/coupons/${id}`);
}

export async function validate(
  code: string,
  orderTotal: number
): Promise<CouponValidationResult> {
  return gateway.post<CouponValidationResult>('/admin/coupons/validate', { code, orderTotal });
}
