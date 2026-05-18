'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { CouponInput } from './CouponInput';
import { CustomerForm } from './CustomerForm';
import type { CartItem, CouponValidationResult } from '@/types';

interface CartPanelProps {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  couponResult: CouponValidationResult | null;
  isValidatingCoupon: boolean;
  isConfirming: boolean;
  onApplyCoupon: (code: string) => void;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onConfirm: (name: string, phone: string) => void;
  currencySymbol?: string;
}

export function CartPanel({
  items,
  subtotal,
  discountAmount,
  total,
  couponResult,
  isValidatingCoupon,
  isConfirming,
  onApplyCoupon,
  onUpdateQty,
  onRemove,
  onConfirm,
  currencySymbol = '$',
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  function handleCustomerChange(field: 'name' | 'phone', value: string) {
    if (field === 'name') setCustomerName(value);
    else setCustomerPhone(value);
  }

  function handleConfirm() {
    onConfirm(customerName, customerPhone);
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900 text-sm">Current Order</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {items.length === 0 && (
          <p className="text-slate-400 text-sm py-4 text-center">Add items to start an order</p>
        )}
        {items.map((item) => (
          <div key={item.menuItemId} className="flex items-center gap-2 py-1.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
              <p className="text-xs text-slate-500">
                {currencySymbol}{item.price.toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onUpdateQty(item.menuItemId, item.quantity - 1)}
                className="w-6 h-6 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center justify-center"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdateQty(item.menuItemId, item.quantity + 1)}
                className="w-6 h-6 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center justify-center"
              >
                +
              </button>
              <button
                onClick={() => onRemove(item.menuItemId)}
                className="ml-1 text-slate-300 hover:text-red-400 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 space-y-3">
        <CouponInput
          onApplyCoupon={onApplyCoupon}
          isValidating={isValidatingCoupon}
          result={couponResult}
        />

        <div className="text-sm space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>−{currencySymbol}{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-100 pt-1">
            <span>Total</span>
            <span>{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>

        <CustomerForm
          name={customerName}
          phone={customerPhone}
          onChange={handleCustomerChange}
        />

        <Button
          className="w-full justify-center"
          loading={isConfirming}
          disabled={items.length === 0 || !customerName || !customerPhone}
          onClick={handleConfirm}
        >
          Confirm Order
        </Button>
      </div>
    </div>
  );
}
