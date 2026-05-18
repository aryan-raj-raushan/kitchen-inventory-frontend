'use client';

import Image from 'next/image';
import Link from 'next/link';
import { StockBadge } from './StockBadge';
import { Badge } from '@/components/common/Badge';
import type { IInventoryItem } from '@/types';

interface ItemCardProps {
  item: IInventoryItem;
  onDeactivate?: (id: string) => void;
}

export function ItemCard({ item, onDeactivate }: ItemCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-36 bg-slate-100 flex items-center justify-center">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized={item.imageUrl.startsWith('http')}
          />
        ) : (
          <span className="text-4xl text-slate-300">🍽️</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{item.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.unit}</p>
          </div>
          <StockBadge stockStatus={item.stockStatus} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">
            ₹{(item.price ?? 0).toFixed(2)}
          </span>
          <span className="text-sm text-slate-600">
            Qty: <strong>{item.currentQuantity}</strong>
          </span>
        </div>

        {item.dailyReset && (
          <Badge variant="DAILY_RESET" />
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Link
            href={`/inventory/${item._id}`}
            className="flex-1 text-center text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg py-1.5 hover:bg-indigo-50 transition-colors"
          >
            Edit
          </Link>
          {item.status === 'ACTIVE' && onDeactivate && (
            <button
              onClick={() => onDeactivate(item._id)}
              className="flex-1 text-center text-sm font-medium text-red-600 border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
            >
              Deactivate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
