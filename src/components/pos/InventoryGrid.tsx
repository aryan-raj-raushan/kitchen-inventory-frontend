'use client';

import { useState, useEffect } from 'react';
import type { POSItem, POSComboItem, ICategory } from '@/types';
import { gateway } from '@/lib/gateway';
import { ItemCard, ComboCard } from './ItemCard';

interface InventoryGridProps {
  onAddItem: (item: Omit<import('@/types').CartItem, 'quantity'>) => void;
  currencySymbol?: string;
}

function getSalePrice(price: number, discountType?: string | null, discountValue?: number): number {
  if (!discountType || !discountValue) return price;
  if (discountType === 'PERCENTAGE') return Math.max(0, price * (1 - discountValue / 100));
  return Math.max(0, price - discountValue);
}

export function InventoryGrid({ onAddItem, currencySymbol = '₹' }: InventoryGridProps) {
  const [items, setItems] = useState<POSItem[]>([]);
  const [combos, setCombos] = useState<POSComboItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (search.trim()) params.set('search', search.trim());
    const query = params.toString() ? `?${params}` : '';

    setLoading(true);
    Promise.all([
      gateway.get<POSItem[]>(`/admin/pos/items${query}`).catch(() => [] as POSItem[]),
      activeCategory === 'all' && !search.trim()
        ? gateway.get<POSComboItem[]>('/admin/pos/combos').catch(() => [] as POSComboItem[])
        : Promise.resolve([] as POSComboItem[]),
    ])
      .then(([posItems, posCompos]) => {
        setItems(posItems);
        setCombos(posCompos);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  useEffect(() => {
    gateway.get<ICategory[]>('/admin/categories').then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search items…"
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat._id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No items available</div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 content-start">
          {combos.map((combo) => (
            <ComboCard
              key={`combo-${combo._id}`}
              item={combo}
              currencySymbol={currencySymbol}
              onAdd={(c) => onAddItem({ inventoryItemId: c._id, name: c.name, price: c.price, isCombo: true })}
            />
          ))}
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              currencySymbol={currencySymbol}
              onAdd={(i) => onAddItem({
                inventoryItemId: i._id,
                name: i.name,
                price: getSalePrice(i.price, i.discountType, i.discountValue),
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
