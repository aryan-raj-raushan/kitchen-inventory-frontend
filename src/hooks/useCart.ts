'use client';

import { useCartStore } from '@/store/cartStore';
import type { IMenuItem } from '@/types';

export function useCart() {
  const { items, subtotal, itemCount, addItem, removeItem, updateQuantity, clearCart } =
    useCartStore();

  function addMenuItem(menuItem: IMenuItem) {
    addItem({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
    });
  }

  function computeDiscountedTotal(discountAmount: number): number {
    return Math.max(0, subtotal - discountAmount);
  }

  return {
    items,
    subtotal,
    itemCount,
    addMenuItem,
    removeItem,
    updateQuantity,
    clearCart,
    computeDiscountedTotal,
  };
}
