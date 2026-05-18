'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, EyeOff, Trash2 } from 'lucide-react';
import { ItemForm } from '@/components/inventory/ItemForm';
import { Modal } from '@/components/common/Modal';
import { getById, update, deactivate, remove } from '@/services/inventory.service';
import { Spinner } from '@/components/common/Spinner';
import type { IInventoryItem, UpdateInventoryItemRequest } from '@/types';

export default function EditInventoryItemPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [item, setItem] = useState<IInventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    getById(slug)
      .then(setItem)
      .catch(() => setError('Item not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(values: UpdateInventoryItemRequest) {
    setIsSubmitting(true);
    setError(null);
    try {
      await update(slug, values);
      toast.success('Item updated successfully');
      router.push('/inventory');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update item';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate() {
    try {
      await deactivate(slug);
      toast.success('Item deactivated');
      router.push('/inventory');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to deactivate');
    }
  }

  async function handleDelete() {
    try {
      await remove(slug);
      toast.success('Item permanently deleted');
      router.push('/inventory');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <p className="text-lg font-medium">Item not found</p>
        <Link href="/inventory" className="text-indigo-600 text-sm hover:underline">Back to inventory</Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/inventory" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Edit Item</h1>
          </div>
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <button
              onClick={() => setDeactivateConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-50 transition-colors"
            >
              <EyeOff size={14} />
              Deactivate
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
          <ItemForm
            defaultValues={item}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={null}
          />
        </div>
      </div>

      {/* Deactivate confirm — portals to body via Modal */}
      {deactivateConfirm && (
        <Modal title="Deactivate Item?" onClose={() => setDeactivateConfirm(false)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              <strong className="text-slate-800">{item.name}</strong> will be hidden from inventory and POS. You can reactivate it anytime via Edit → Status.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeactivateConfirm(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm — permanent, portals to body via Modal */}
      {deleteConfirm && (
        <Modal title="Permanently Delete?" onClose={() => setDeleteConfirm(false)} size="sm">
          <div className="space-y-4">
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              This cannot be undone. <strong>{item.name}</strong> and all its stock history will be permanently removed.
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
