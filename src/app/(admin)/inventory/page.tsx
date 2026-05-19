'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Package,
  AlertCircle,
  RotateCcw,
  X,
  Sunrise,
} from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useStockMovement } from '@/hooks/useStockMovement';
import { useDailyReset } from '@/hooks/useDailyReset';
import { ItemCard } from '@/components/inventory/ItemCard';
import { MovementForm } from '@/components/inventory/MovementForm';
import { Modal } from '@/components/common/Modal';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { IInventoryItem } from '@/types';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

function normalizeCategoryId(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'object' && raw !== null && '_id' in raw) {
    return String((raw as { _id: unknown })._id);
  }
  return String(raw);
}

function getCategoryName(raw: unknown): string {
  if (typeof raw === 'object' && raw !== null && 'name' in raw) {
    return String((raw as { name: string }).name);
  }
  return '';
}

export default function InventoryPage() {
  const { items, isLoading, error, refetch, deactivate } = useInventory();
  const { pendingItems } = useDailyReset();
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ACTIVE');

  const movement = useStockMovement(() => {
    setSelectedItem(null);
    refetch();
  });

  // Derive categories from populated items
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    items.forEach((item) => {
      const id = normalizeCategoryId(item.categoryId);
      const name = getCategoryName(item.categoryId);
      if (id && name) seen.set(id, name);
    });
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Client-side filtered items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (activeCategory !== 'all' && normalizeCategoryId(item.categoryId) !== activeCategory) return false;
      if (search.trim() && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, activeCategory, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((i) => i.status === 'ACTIVE').length,
    outOfStock: items.filter((i) => i.status === 'ACTIVE' && i.currentQuantity === 0).length,
    dailyReset: items.filter((i) => i.dailyReset && i.status === 'ACTIVE').length,
  }), [items]);

  const hasFilters = search || activeCategory !== 'all' || statusFilter !== 'ACTIVE';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          {!isLoading && (
            <p className="text-sm text-slate-400 mt-0.5">{stats.active} active items</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {pendingItems.length > 0 && (
            <Link
              href="/inventory/daily-reset"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-sm animate-fade-in"
            >
              <Sunrise size={13} />
              Daily Reset ({pendingItems.length})
            </Link>
          )}
          <Link
            href="/inventory/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Item
          </Link>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      {!isLoading && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Items', value: stats.total, icon: Package, color: 'text-slate-600', bg: 'bg-slate-50' },
              { label: 'Active', value: stats.active, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Daily Reset', value: stats.dailyReset, icon: RotateCcw, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl px-4 py-3.5 flex items-center gap-3 animate-fade-in`}>
                <div className={`w-9 h-9 rounded-xl ${bg} border border-white/60 flex items-center justify-center`}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items…"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status + Category */}
            <div className="flex flex-wrap gap-2">
              {/* Status pills */}
              {(['ALL', 'ACTIVE', 'INACTIVE'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {s === 'ALL' ? 'All Status' : s === 'ACTIVE' ? 'Active' : 'Inactive'}
                </button>
              ))}

              <div className="w-px bg-slate-200 self-stretch mx-1" />

              {/* Category tabs */}
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); setStatusFilter('ACTIVE'); }}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                <X size={11} />
                Clear filters
              </button>
            )}
          </div>
        </>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-slate-300" />
          </div>
          {items.length === 0 ? (
            <>
              <p className="text-slate-500 font-medium">No inventory items yet</p>
              <Link href="/inventory/new" className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                <Plus size={14} />
                Add your first item
              </Link>
            </>
          ) : (
            <>
              <p className="text-slate-500 font-medium">No items match your filters</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('all'); setStatusFilter('ALL'); }}
                className="mt-2 text-sm text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <ItemCard
              key={item._id}
              item={item}
              categoryName={getCategoryName(item.categoryId)}
              index={i}
              onStockIn={setSelectedItem}
              onDeactivate={(id) => deactivate(id)}
            />
          ))}
        </div>
      )}

      {selectedItem && (
        <Modal title={`Stock — ${selectedItem.name}`} onClose={() => setSelectedItem(null)}>
          <MovementForm
            itemName={selectedItem.name}
            onSubmit={(type, qty, notes) => movement.submit(selectedItem._id, type, qty, notes)}
            isSubmitting={movement.isSubmitting}
            error={movement.error}
          />
        </Modal>
      )}
    </div>
  );
}
