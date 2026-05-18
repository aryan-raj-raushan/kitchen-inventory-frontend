'use client';

import { useState } from 'react';
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) return;
    onSubmit(type, qty, notes || undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Recording movement for <strong>{itemName}</strong>
      </p>

      <div className="flex gap-4">
        {(['MANUAL_IN', 'MANUAL_OUT'] as const).map((t) => (
          <label key={t} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="movementType"
              value={t}
              checked={type === t}
              onChange={() => setType(t)}
              className="accent-blue-600"
            />
            <span className="text-sm font-medium text-slate-700">
              {t === 'MANUAL_IN' ? 'Stock In' : 'Stock Out'}
            </span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Reason for adjustment…"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={isSubmitting} className="w-full justify-center">
        Record Movement
      </Button>
    </form>
  );
}
