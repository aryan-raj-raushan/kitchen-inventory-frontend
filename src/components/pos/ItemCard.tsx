'use client';

import Image from 'next/image';
import type { POSItem } from '@/types';

interface ItemCardProps {
  item: POSItem;
  onAdd: (item: POSItem) => void;
  currencySymbol?: string;
}

export function ItemCard({ item, onAdd, currencySymbol = '₹' }: ItemCardProps) {
  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left overflow-hidden group w-full"
    >
      <div className="relative h-28 bg-slate-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized={item.imageUrl.startsWith('http')}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-4xl text-slate-300 select-none">
            🍽️
          </div>
        )}
        {item.currentQuantity === 0 && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-slate-900/60 px-2 py-0.5 rounded-full">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 leading-tight">
          {item.name}
        </p>
        <p className="text-base font-bold text-indigo-600 mt-1">
          {currencySymbol}{(item.price ?? 0).toFixed(2)}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.currentQuantity > 0 ? `${item.currentQuantity} in stock` : 'Unavailable'}
        </p>
      </div>
    </button>
  );
}
