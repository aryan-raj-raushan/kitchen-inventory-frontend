'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInventory } from '@/hooks/useInventory';
import { useInventoryReset } from '@/hooks/useInventoryReset';
import { useStockMovement } from '@/hooks/useStockMovement';
import { ItemCard } from '@/components/inventory/ItemCard';
import { MovementForm } from '@/components/inventory/MovementForm';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { IInventoryItem, StockStatus } from '@/types';

export default function InventoryPage() {
  const { items, isLoading, error, refetch, deactivateItem } = useInventory();
  const reset = useInventoryReset(refetch);
  const [selectedItem, setSelectedItem] = useState<(IInventoryItem & { stockStatus: StockStatus }) | null>(null);
  const movement = useStockMovement(() => {
    setSelectedItem(null);
    refetch();
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Inventory</h1>
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            loading={reset.isResetting}
            onClick={reset.promptReset}
          >
            Daily Reset
          </Button>
          <Link href="/inventory/new">
            <Button size="sm">Add Item</Button>
          </Link>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}
      {reset.error && <Alert variant="error" message={reset.error} />}
      {reset.result && (
        <Alert variant="success" message={`Reset complete — ${reset.result.resetCount} items restored to par level`} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onEdit={() => {}}
              onDeactivate={() => deactivateItem(item._id)}
              onRecordMovement={() => setSelectedItem(item)}
            />
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-slate-400 py-12">
              No inventory items yet.{' '}
              <Link href="/inventory/new" className="text-blue-600 hover:underline">
                Add one
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Daily reset confirmation */}
      {reset.showConfirm && (
        <Modal title="Confirm Daily Reset" onClose={reset.cancel}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              This will restore ALL active inventory items to their par levels. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={reset.cancel}>Cancel</Button>
              <Button variant="danger" onClick={reset.confirm}>Confirm Reset</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Stock movement modal */}
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
