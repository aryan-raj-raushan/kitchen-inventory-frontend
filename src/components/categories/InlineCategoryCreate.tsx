'use client';

import { useState } from 'react';
import { gateway } from '@/lib/gateway';
import type { ICategory } from '@/types';

interface InlineCategoryCreateProps {
  onCreated: (category: ICategory) => void;
}

export function InlineCategoryCreate({ onCreated }: InlineCategoryCreateProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const category = await gateway.post<ICategory>('/admin/categories', { name: name.trim() });
      onCreated(category);
      setName('');
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
      >
        + New category
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Add'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setName(''); setError(''); }}
          className="px-2 py-1.5 text-slate-500 text-sm hover:text-slate-700"
        >
          ✕
        </button>
      </form>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
