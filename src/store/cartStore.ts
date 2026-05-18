'use client';

import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
}

function computeSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function computeItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  itemCount: 0,

  addItem: (item) => {
    const existing = get().items.find((i) => i.menuItemId === item.menuItemId);
    let next: CartItem[];
    if (existing) {
      next = get().items.map((i) =>
        i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      next = [...get().items, { ...item, quantity: 1 }];
    }
    set({ items: next, subtotal: computeSubtotal(next), itemCount: computeItemCount(next) });
  },

  removeItem: (menuItemId) => {
    const next = get().items.filter((i) => i.menuItemId !== menuItemId);
    set({ items: next, subtotal: computeSubtotal(next), itemCount: computeItemCount(next) });
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    const next = get().items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i));
    set({ items: next, subtotal: computeSubtotal(next), itemCount: computeItemCount(next) });
  },

  clearCart: () => set({ items: [], subtotal: 0, itemCount: 0 }),
}));
