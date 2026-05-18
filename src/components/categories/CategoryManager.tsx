'use client';

import { useState } from 'react';
import { Pencil, Trash2, Check, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { gateway } from '@/lib/gateway';
import type { ICategory } from '@/types';

interface CategoryManagerProps {
  categories: ICategory[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreated: (category: ICategory) => void;
  onUpdated: (category: ICategory) => void;
  onDeleted: (id: string) => void;
}

export function CategoryManager({
  categories,
  selectedId,
  onSelect,
  onCreated,
  onUpdated,
  onDeleted,
}: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selected = categories.find((c) => c._id === selectedId);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const cat = await gateway.post<ICategory>('/admin/categories', { name: newName.trim() });
      onCreated(cat);
      setNewName('');
      onSelect(cat._id);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: ICategory) {
    setEditingId(cat._id);
    setEditName(cat.name);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const updated = await gateway.patch<ICategory>(`/admin/categories/${id}`, { name: editName.trim() });
      onUpdated(updated);
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
      await gateway.delete(`/admin/categories/${id}`);
      onDeleted(id);
      if (selectedId === id) onSelect('');
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-1.5">
      {/* Trigger — shows selected category name */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          open ? 'border-indigo-400 ring-2 ring-indigo-500' : 'border-slate-200'
        } bg-white`}
      >
        <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
          {selected ? selected.name : 'Select category…'}
        </span>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      {open && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
          {/* Category list */}
          <div className="max-h-48 overflow-y-auto">
            {categories.length === 0 && (
              <p className="text-xs text-slate-400 px-3 py-3 text-center">No categories yet</p>
            )}
            {categories.map((cat) => (
              <div
                key={cat._id}
                className={`flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors ${
                  selectedId === cat._id ? 'bg-indigo-50' : ''
                }`}
              >
                {editingId === cat._id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') { e.preventDefault(); saveEdit(cat._id); }
                        if (e.key === 'Escape') { e.preventDefault(); setEditingId(null); }
                      }}
                      className="flex-1 text-sm border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => saveEdit(cat._id)}
                      className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { onSelect(cat._id); setOpen(false); }}
                      className="flex-1 text-left text-sm text-slate-700 truncate"
                    >
                      {cat.name}
                    </button>
                    {selectedId === cat._id && (
                      <Check size={12} className="text-indigo-600 flex-shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-shrink-0"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === cat._id}
                      onClick={() => handleDelete(cat._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 disabled:opacity-40"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Divider + create — no nested <form>, uses type="button" to avoid outer form submit */}
          <div className="border-t border-slate-100 p-2">
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
                placeholder="New category name…"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                disabled={creating || !newName.trim()}
                onClick={handleCreate}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Plus size={12} />
                {creating ? '…' : 'Add'}
              </button>
            </div>
            {createError && <p className="text-xs text-red-500 mt-1 px-1">{createError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
