'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { createOrder } from '@/services/order.service';
import { validate } from '@/services/coupon.service';
import type { IOrder, CouponValidationResult } from '@/types';

export function usePOS() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderResult, setOrderResult] = useState<IOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const { items: cartItems, subtotal, clearCart } = useCartStore();

  async function applyCoupon(code: string) {
    if (!code.trim()) {
      setCouponResult(null);
      setCouponCode('');
      return;
    }
    setIsValidatingCoupon(true);
    try {
      const result = await validate(code, subtotal);
      setCouponResult(result);
      setCouponCode(result.valid ? code : '');
    } catch (e) {
      setCouponResult({ valid: false, reason: e instanceof Error ? e.message : 'Validation failed', discountAmount: 0, newTotal: subtotal });
      setCouponCode('');
    } finally {
      setIsValidatingCoupon(false);
    }
  }

  async function confirmOrder(customerName: string, customerPhone: string) {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      return;
    }
    setIsConfirming(true);
    setError(null);
    try {
      const order = await createOrder({
        customerName,
        customerPhone,
        couponCode: couponCode || undefined,
        items: cartItems.map((i) =>
          i.isCombo
            ? { comboId: i.inventoryItemId, quantity: i.quantity }
            : { inventoryItemId: i.inventoryItemId, quantity: i.quantity }
        ),
      });
      setOrderResult(order);
      clearCart();
      setCouponCode('');
      setCouponResult(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to confirm order');
    } finally {
      setIsConfirming(false);
    }
  }

  function resetOrder() {
    setOrderResult(null);
    setError(null);
  }

  const discountAmount = couponResult?.valid ? couponResult.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount);

  return {
    isConfirming,
    orderResult,
    error,
    couponResult,
    isValidatingCoupon,
    subtotal,
    discountAmount,
    total,
    applyCoupon,
    confirmOrder,
    resetOrder,
  };
}
