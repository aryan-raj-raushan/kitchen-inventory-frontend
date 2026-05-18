'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { useStockMovement } from '@/hooks/useStockMovement';
import { ItemCard } from '@/components/inventory/ItemCard';
import { MovementForm } from '@/components/inventory/MovementForm';
import { DailyResetPrompt } from '@/components/inventory/DailyResetPrompt';
import { Modal } from '@/components/common/Modal';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { IInventoryItem } from '@/types';

export default function InventoryPage() {
  const { items, isLoading, error, refetch, deactivate } = useInventory();
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | null>(null);
  const movement = useStockMovement(() => {
    setSelectedItem(null);
    refetch();
  });

  return (
    <div className="space-y-6">
      {/* Daily reset prompt — shown when reset items need today's quantity */}
      <DailyResetPrompt onConfirmed={refetch} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <Link
          href="/inventory/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          + Add Item
        </Link>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onDeactivate={(id) => deactivate(id)}
            />
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-slate-400 py-16">
              No inventory items yet.{' '}
              <Link href="/inventory/new" className="text-indigo-600 hover:underline">
                Add one
              </Link>
            </p>
          )}
        </div>
      )}

      {selectedItem && (
        <Modal title="Record Stock Movement" onClose={() => setSelectedItem(null)}>
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
