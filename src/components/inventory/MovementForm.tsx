'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface MovementFormProps {
  itemName: string;
  onSubmit: (type: 'MANUAL_IN' | 'MANUAL_OUT', quantity: number, notes?: string) => void;
  isSubmitting: boolean;
  error: string | null;
}

export function MovementForm({ itemName, onSubmit, isSubmitting, error }: MovementFormProps) {
  const [type, setType] = useState<'MANUAL_IN' | 'MANUAL_OUT'>('MANUAL_IN');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) return;
    onSubmit(type, qty, notes || undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-500">
        Recording movement for <strong className="text-slate-800">{itemName}</strong>
      </p>

      <div className="flex gap-3">
        {(['MANUAL_IN', 'MANUAL_OUT'] as const).map((t) => {
          const active = type === t;
          const Icon = t === 'MANUAL_IN' ? TrendingUp : TrendingDown;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                active
                  ? t === 'MANUAL_IN'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              {t === 'MANUAL_IN' ? 'Stock In' : 'Stock Out'}
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className={inputClass}
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Reason for adjustment…"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full justify-center">
        Record Movement
      </Button>
    </form>
  );
}
