'use client';

import { useCartStore } from '@/store/cartStore';

export function useCart() {
  const { items, subtotal, itemCount, addItem, removeItem, updateQuantity, clearCart } =
    useCartStore();

  return {
    items,
    subtotal,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
