'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Pencil, TrendingUp, UtensilsCrossed, Layers } from 'lucide-react';
import type { IInventoryItem } from '@/types';

interface ItemCardProps {
  item: IInventoryItem;
  categoryName?: string;
  onStockIn?: (item: IInventoryItem) => void;
  onDeactivate?: (id: string) => void;
  index?: number;
}

function getSalePrice(price: number, discountType?: string | null, discountValue?: number): number {
  if (!discountType || !discountValue) return price;
  if (discountType === 'PERCENTAGE') return Math.max(0, price * (1 - discountValue / 100));
  return Math.max(0, price - discountValue);
}

function stockColor(qty: number) {
  if (qty === 0) return 'text-red-600 bg-red-50';
  if (qty <= 5) return 'text-amber-600 bg-amber-50';
  return 'text-emerald-600 bg-emerald-50';
}

export function ItemCard({ item, categoryName, onStockIn, onDeactivate, index = 0 }: ItemCardProps) {
  const editHref = `/inventory/${item.slug ?? item._id}`;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col group hover:shadow-lg hover:border-slate-200 transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Image */}
      <div className="relative h-40 bg-slate-50 overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={item.imageUrl.startsWith('http')}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <UtensilsCrossed size={36} className="text-slate-200" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute inset-x-0 top-0 p-2 flex items-start justify-between">
          {item.dailyReset && (
            <span className="text-xs font-medium bg-indigo-600 text-white px-2 py-0.5 rounded-full">
              Daily
            </span>
          )}
          <span
            className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
              item.status === 'INACTIVE'
                ? 'bg-slate-800/70 text-slate-200'
                : item.currentQuantity === 0
                ? 'bg-red-500/90 text-white'
                : item.currentQuantity <= 5
                ? 'bg-amber-400/90 text-amber-900'
                : 'bg-emerald-500/90 text-white'
            }`}
          >
            {item.status === 'INACTIVE'
              ? 'Inactive'
              : item.currentQuantity === 0
              ? 'Out of stock'
              : `${item.currentQuantity} ${item.unit}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        {/* Category */}
        {categoryName && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Layers size={11} />
            <span className="truncate">{categoryName}</span>
          </div>
        )}

        {/* Name + price */}
        <div>
          <p className="font-semibold text-slate-900 truncate text-sm leading-tight" title={item.name}>
            {item.name}
          </p>
          {item.discountType && (item.discountValue ?? 0) > 0 ? (
            <div className="mt-0.5">
              <p className="text-xs text-slate-400 line-through leading-none">
                ₹{(item.price ?? 0).toFixed(2)}
              </p>
              <p className="text-lg font-bold text-emerald-600 leading-tight">
                ₹{getSalePrice(item.price, item.discountType, item.discountValue).toFixed(2)}
                <span className="ml-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                  {item.discountType === 'PERCENTAGE' ? `${item.discountValue}% off` : `₹${item.discountValue} off`}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-lg font-bold text-indigo-600 mt-0.5">
              ₹{(item.price ?? 0).toFixed(2)}
            </p>
          )}
        </div>

        {/* Qty indicator */}
        <div className={`flex items-center gap-1.5 self-start text-xs font-medium px-2 py-1 rounded-lg ${stockColor(item.currentQuantity)}`}>
          <span>Qty</span>
          <span className="font-bold">{item.currentQuantity}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={editHref}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl py-2 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
          >
            <Pencil size={12} />
            Edit
          </Link>
          {onStockIn && item.status === 'ACTIVE' && (
            <button
              onClick={() => onStockIn(item)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-xl py-2 hover:bg-indigo-50 transition-all"
            >
              <TrendingUp size={12} />
              Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
