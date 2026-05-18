'use client';

import { Badge } from '@/components/common/Badge';
import type { IMenuItem } from '@/types';

interface MenuGridProps {
  items: IMenuItem[];
  onSelectItem: (item: IMenuItem) => void;
}

export function MenuGrid({ items, onSelectItem }: MenuGridProps) {
  const grouped: Record<string, IMenuItem[]> = {};
  for (const item of items) {
    const key = item.categoryId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  return (
    <div className="space-y-6">
      {items.length === 0 && (
        <p className="text-slate-400 text-sm">No menu items available.</p>
      )}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryItems.map((item) => (
              <button
                key={item._id}
                disabled={!item.available}
                onClick={() => onSelectItem(item)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  item.available
                    ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer'
                    : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
                }`}
              >
                <p className="font-medium text-slate-900 text-sm leading-tight">{item.name}</p>
                <p className="mt-1 text-slate-500 text-xs">${item.price.toFixed(2)}</p>
                {!item.available && (
                  <span className="mt-1.5 block">
                    <Badge variant="OUT_OF_STOCK" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
