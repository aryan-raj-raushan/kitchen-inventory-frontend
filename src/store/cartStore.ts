'use client';

import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (inventoryItemId: string) => void;
  updateQuantity: (inventoryItemId: string, quantity: number) => void;
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
    const existing = get().items.find((i) => i.inventoryItemId === item.inventoryItemId);
    let next: CartItem[];
    if (existing) {
      next = get().items.map((i) =>
        i.inventoryItemId === item.inventoryItemId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      next = [...get().items, { ...item, quantity: 1 }];
    }
    set({ items: next, subtotal: computeSubtotal(next), itemCount: computeItemCount(next) });
  },

  removeItem: (inventoryItemId) => {
    const next = get().items.filter((i) => i.inventoryItemId !== inventoryItemId);
    set({ items: next, subtotal: computeSubtotal(next), itemCount: computeItemCount(next) });
  },

  updateQuantity: (inventoryItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(inventoryItemId);
      return;
    }
    const next = get().items.map((i) =>
      i.inventoryItemId === inventoryItemId ? { ...i, quantity } : i
    );
    set({ items: next, subtotal: computeSubtotal(next), itemCount: computeItemCount(next) });
  },

  clearCart: () => set({ items: [], subtotal: 0, itemCount: 0 }),
}));
