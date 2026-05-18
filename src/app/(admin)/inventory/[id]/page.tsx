'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ItemForm } from '@/components/inventory/ItemForm';
import { getById, update, deactivate } from '@/services/inventory.service';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { IInventoryItem, UpdateInventoryItemRequest } from '@/types';

export default function EditInventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<IInventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    getById(id)
      .then(setItem)
      .catch(() => setError('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values: UpdateInventoryItemRequest) {
    setIsSubmitting(true);
    setError(null);
    try {
      await update(id, values);
      router.push('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await deactivate(id);
      router.push('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate item');
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!item) {
    return <Alert variant="error" message="Item not found" />;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inventory" className="text-slate-400 hover:text-slate-600">← Back</Link>
          <h1 className="text-2xl font-bold text-slate-900">Edit Item</h1>
        </div>
        <button
          onClick={() => setDeleteConfirm(true)}
          className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
        >
          Deactivate
        </button>
      </div>

      {error && <Alert variant="error" message={error} />}

      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
        <ItemForm
          defaultValues={item}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Deactivate Item?</h2>
            <p className="text-sm text-slate-500 mb-4">
              This will hide <strong>{item.name}</strong> from inventory and POS. You can reactivate it later.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
