'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, Check, X, Plus, Search } from 'lucide-react';
import { gateway } from '@/lib/gateway';
import type { IInventoryItem, ICategory } from '@/types';

interface ComponentItemPickerProps {
  items: IInventoryItem[];
  categories: ICategory[];
  selectedId: string;
  onSelect: (id: string) => void;
  onItemCreated: (item: IInventoryItem) => void;
  onItemUpdated: (item: IInventoryItem) => void;
  onItemDeleted: (id: string) => void;
}

export function ComponentItemPicker({
  items,
  categories,
  selectedId,
  onSelect,
  onItemCreated,
  onItemUpdated,
  onItemDeleted,
}: ComponentItemPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);

  // Create state
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selected = items.find((it) => it._id === selectedId);

  const filtered = items.filter((it) =>
    !search.trim() || it.name.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(item: IInventoryItem) {
    setEditingId(item._id);
    setEditName(item.name);
    setEditUnit(item.unit);
    setEditPrice(String(item.price));
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const updated = await gateway.patch<IInventoryItem>(`/admin/inventory/${id}`, {
        name: editName.trim(),
        unit: editUnit.trim() || undefined,
        price: parseFloat(editPrice) || undefined,
      });
      onItemUpdated(updated);
      setEditingId(null);
    } catch {
      // silently ignore; user can retry
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await gateway.delete(`/admin/inventory/${id}`);
      onItemDeleted(id);
      if (selectedId === id) onSelect('');
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreate() {
    if (!newName.trim() || !newUnit.trim() || !newCategoryId) {
      setCreateError('Name, unit, and category are required');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      const item = await gateway.post<IInventoryItem>('/admin/inventory', {
        name: newName.trim(),
        unit: newUnit.trim(),
        price: parseFloat(newPrice) || 0,
        categoryId: newCategoryId,
        currentQuantity: 0,
        dailyReset: false,
      });
      onItemCreated(item);
      onSelect(item._id);
      setNewName('');
      setNewUnit('');
      setNewPrice('');
      setNewCategoryId('');
      setOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error creating item');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex-1 space-y-1">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          open ? 'border-indigo-400 ring-2 ring-indigo-500' : 'border-slate-200'
        } bg-white`}
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {selected ? `${selected.name} (${selected.unit})` : 'Select item…'}
        </span>
        {open ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
      </button>

      {open && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-20 relative">
          {/* Search */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items…"
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Item list */}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-xs text-slate-400 px-3 py-3 text-center">No items found</p>
            )}
            {filtered.map((item) => (
              <div
                key={item._id}
                className={`flex items-center gap-1.5 px-3 py-2 hover:bg-slate-50 transition-colors ${
                  selectedId === item._id ? 'bg-indigo-50' : ''
                }`}
              >
                {editingId === item._id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') { e.preventDefault(); saveEdit(item._id); }
                        if (e.key === 'Escape') { e.preventDefault(); setEditingId(null); }
                      }}
                      className="w-28 text-xs border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Name"
                    />
                    <input
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="w-14 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Unit"
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="₹"
                      min="0"
                      step="0.01"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => saveEdit(item._id)}
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { onSelect(item._id); setOpen(false); setSearch(''); }}
                      className="flex-1 text-left text-sm text-slate-700 truncate"
                    >
                      {item.name}
                      <span className="text-slate-400 text-xs ml-1">({item.unit}) ₹{item.price}</span>
                    </button>
                    {selectedId === item._id && (
                      <Check size={11} className="text-indigo-600 flex-shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-shrink-0"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item._id}
                      onClick={() => handleDelete(item._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 disabled:opacity-40"
                    >
                      <Trash2 size={11} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Quick create */}
          <div className="border-t border-slate-100 p-2 space-y-2">
            <p className="text-xs font-medium text-slate-500 px-1">Quick add new item</p>
            <div className="flex gap-1.5 flex-wrap">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
                placeholder="Item name"
                className="flex-1 min-w-24 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Unit"
                className="w-16 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="₹ Price"
                min="0"
                step="0.01"
                className="w-20 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-1.5">
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select category…</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={creating || !newName.trim() || !newUnit.trim() || !newCategoryId}
                onClick={handleCreate}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Plus size={11} />
                {creating ? '…' : 'Add'}
              </button>
            </div>
            {createError && <p className="text-xs text-red-500 px-1">{createError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
