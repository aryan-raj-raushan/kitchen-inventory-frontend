'use client';

import Image from 'next/image';
import { UtensilsCrossed, Layers } from 'lucide-react';
import type { POSItem, POSComboItem } from '@/types';

function getSalePrice(price: number, discountType?: string | null, discountValue?: number): number {
  if (!discountType || !discountValue) return price;
  if (discountType === 'PERCENTAGE') return Math.max(0, price * (1 - discountValue / 100));
  return Math.max(0, price - discountValue);
}

interface POSItemCardProps {
  item: POSItem;
  onAdd: (item: POSItem) => void;
  currencySymbol?: string;
}

interface ComboCardProps {
  item: POSComboItem;
  onAdd: (item: POSComboItem) => void;
  currencySymbol?: string;
}

export function ItemCard({ item, onAdd, currencySymbol = '₹' }: POSItemCardProps) {
  const salePrice = getSalePrice(item.price, item.discountType, item.discountValue);
  const hasDiscount = !!item.discountType && (item.discountValue ?? 0) > 0;

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
          <div className="h-full flex items-center justify-center">
            <UtensilsCrossed size={32} className="text-slate-200" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {item.discountType === 'PERCENTAGE' ? `${item.discountValue}% OFF` : `₹${item.discountValue} OFF`}
          </span>
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
        {hasDiscount ? (
          <div className="mt-1">
            <p className="text-xs text-slate-400 line-through leading-none">{currencySymbol}{item.price.toFixed(2)}</p>
            <p className="text-base font-bold text-emerald-600">{currencySymbol}{salePrice.toFixed(2)}</p>
          </div>
        ) : (
          <p className="text-base font-bold text-indigo-600 mt-1">
            {currencySymbol}{(item.price ?? 0).toFixed(2)}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-0.5">
          {item.currentQuantity > 0 ? `${item.currentQuantity} in stock` : 'Unavailable'}
        </p>
      </div>
    </button>
  );
}

export function ComboCard({ item, onAdd, currencySymbol = '₹' }: ComboCardProps) {
  return (
    <button
      type="button"
      onClick={() => onAdd(item)}
      className="bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left overflow-hidden group w-full"
    >
      <div className="relative h-28 bg-indigo-50">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized={item.imageUrl.startsWith('http')}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Layers size={32} className="text-indigo-200" />
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          COMBO
        </span>
      </div>

      <div className="p-3">
        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 leading-tight">
          {item.name}
        </p>
        <p className="text-base font-bold text-indigo-600 mt-1">
          {currencySymbol}{item.price.toFixed(2)}
        </p>
        {item.description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description}</p>
        )}
      </div>
    </button>
  );
}
