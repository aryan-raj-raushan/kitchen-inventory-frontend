'use client';

import { useState } from 'react';
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
  currencySymbol = '₹',
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-md">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">Current Order</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
        {items.length === 0 && (
          <p className="text-slate-400 text-sm py-6 text-center">Add items to start an order</p>
        )}
        {items.map((item) => (
          <div key={item.inventoryItemId} className="flex items-center gap-3 py-2 border-b border-slate-50">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
              <p className="text-xs text-slate-400">
                {currencySymbol}{(item.price ?? 0).toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onUpdateQty(item.inventoryItemId, item.quantity - 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold flex items-center justify-center"
              >
                −
              </button>
              <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                onClick={() => onUpdateQty(item.inventoryItemId, item.quantity + 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold flex items-center justify-center"
              >
                +
              </button>
              <button
                onClick={() => onRemove(item.inventoryItemId)}
                className="ml-1 text-slate-300 hover:text-red-400 text-sm"
              >
                ✕
              </button>
            </div>
            <span className="text-sm font-semibold text-slate-700 w-16 text-right shrink-0">
              {currencySymbol}{((item.price ?? 0) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 space-y-4">
        <CouponInput
          onApplyCoupon={onApplyCoupon}
          isValidating={isValidatingCoupon}
          result={couponResult}
        />

        <div className="text-sm space-y-1.5">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount</span>
              <span>−{currencySymbol}{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-2 mt-1">
            <span>Total</span>
            <span>{currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>

        <CustomerForm
          name={customerName}
          phone={customerPhone}
          onChange={(field, value) => {
            if (field === 'name') setCustomerName(value);
            else setCustomerPhone(value);
          }}
        />

        <button
          disabled={items.length === 0 || !customerName || !customerPhone || isConfirming}
          onClick={() => onConfirm(customerName, customerPhone)}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isConfirming ? 'Processing…' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}
