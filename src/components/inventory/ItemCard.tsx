'use client';

import { StockBadge } from './StockBadge';
import { Button } from '@/components/common/Button';
import type { IInventoryItem, StockStatus } from '@/types';

interface ItemCardProps {
  item: IInventoryItem & { stockStatus: StockStatus };
  onEdit: () => void;
  onDeactivate: () => void;
  onRecordMovement: () => void;
}

export function ItemCard({ item, onEdit, onDeactivate, onRecordMovement }: ItemCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{item.unit}</p>
        </div>
        <StockBadge stockStatus={item.stockStatus} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-slate-50 px-2 py-1.5">
          <p className="text-lg font-bold text-slate-900">{item.currentQuantity}</p>
          <p className="text-xs text-slate-500">Current</p>
        </div>
        <div className="rounded-md bg-slate-50 px-2 py-1.5">
          <p className="text-lg font-semibold text-slate-700">{item.minimumThreshold}</p>
          <p className="text-xs text-slate-500">Min</p>
        </div>
        <div className="rounded-md bg-slate-50 px-2 py-1.5">
          <p className="text-lg font-semibold text-slate-700">{item.parLevel}</p>
          <p className="text-xs text-slate-500">Par</p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="secondary" onClick={onRecordMovement}>
          Stock In/Out
        </Button>
        <Button size="sm" variant="secondary" onClick={onEdit}>
          Edit
        </Button>
        {item.status === 'ACTIVE' && (
          <Button size="sm" variant="danger" onClick={onDeactivate}>
            Deactivate
          </Button>
        )}
      </div>
    </div>
  );
}
