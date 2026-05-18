import { gateway } from '@/lib/gateway';
import type { ICoupon, CreateCouponRequest, CouponValidationResult } from '@/types';

export async function getAll(): Promise<ICoupon[]> {
  return gateway.get<ICoupon[]>('/admin/coupons');
}

export async function create(data: CreateCouponRequest): Promise<ICoupon> {
  return gateway.post<ICoupon>('/admin/coupons', data);
}

export async function update(id: string, data: Partial<CreateCouponRequest>): Promise<ICoupon> {
  return gateway.put<ICoupon>(`/admin/coupons/${id}`, data);
}

export async function deactivate(id: string): Promise<ICoupon> {
  return gateway.put<ICoupon>(`/admin/coupons/${id}`, { status: 'DEACTIVATED' });
}

export async function validate(
  code: string,
  orderTotal: number
): Promise<CouponValidationResult> {
  return gateway.post<CouponValidationResult>('/admin/coupons/validate', { code, orderTotal });
}
