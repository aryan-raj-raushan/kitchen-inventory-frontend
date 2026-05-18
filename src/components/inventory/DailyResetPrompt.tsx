'use client';

import { useState } from 'react';
import { useDailyReset } from '@/hooks/useDailyReset';

interface DailyResetPromptProps {
  onConfirmed?: () => void;
}

export function DailyResetPrompt({ onConfirmed }: DailyResetPromptProps) {
  const { pendingItems, isLoading, confirmQuantity } = useDailyReset();
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoading || pendingItems.length === 0) return null;

  async function handleConfirm(itemId: string) {
    const rawQty = quantities[itemId];
    const qty = Number(rawQty);
    if (rawQty === undefined || rawQty === '' || isNaN(qty) || qty < 0) {
      setErrors((e) => ({ ...e, [itemId]: 'Enter a valid quantity (≥ 0)' }));
      return;
    }
    setSubmitting(itemId);
    setErrors((e) => ({ ...e, [itemId]: '' }));
    try {
      await confirmQuantity(itemId, qty);
      onConfirmed?.();
    } catch (err) {
      setErrors((e) => ({ ...e, [itemId]: err instanceof Error ? err.message : 'Error' }));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🌅</span>
        <div>
          <h2 className="font-semibold text-amber-900">Daily Reset — Enter Today&apos;s Quantities</h2>
          <p className="text-sm text-amber-700 mt-0.5">
            {pendingItems.length} item{pendingItems.length > 1 ? 's' : ''} need today&apos;s starting quantity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pendingItems.map((item) => (
          <div key={item._id} className="bg-white rounded-xl border border-amber-100 p-3 flex items-center gap-3">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
              <p className="text-xs text-slate-400">{item.unit}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="number"
                min="0"
                value={quantities[item._id] ?? ''}
                onChange={(e) => setQuantities((q) => ({ ...q, [item._id]: e.target.value }))}
                placeholder="0"
                className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={() => handleConfirm(item._id)}
                disabled={submitting === item._id}
                className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {submitting === item._id ? '…' : 'Set'}
              </button>
            </div>
            {errors[item._id] && (
              <p className="text-xs text-red-500 col-span-full">{errors[item._id]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
