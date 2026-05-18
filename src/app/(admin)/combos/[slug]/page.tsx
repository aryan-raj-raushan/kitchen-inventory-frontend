'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { ComboForm } from '@/components/combos/ComboForm';
import { Modal } from '@/components/common/Modal';
import { Spinner } from '@/components/common/Spinner';
import { getById, update, remove } from '@/services/combo.service';
import type { ICombo, UpdateComboRequest } from '@/types';

export default function EditComboPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [combo, setCombo] = useState<ICombo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    getById(slug)
      .then(setCombo)
      .catch(() => setError('Combo not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(data: UpdateComboRequest) {
    setIsSubmitting(true);
    setError(null);
    try {
      await update(slug, data);
      toast.success('Combo updated');
      router.push('/combos');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update combo';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await remove(slug);
      toast.success('Combo deleted');
      router.push('/combos');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  if (!combo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <p className="text-lg font-medium">Combo not found</p>
        <Link href="/combos" className="text-indigo-600 text-sm hover:underline">Back to combos</Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/combos" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Edit Combo</h1>
          </div>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
          <ComboForm
            defaultValues={combo}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={null}
          />
        </div>
      </div>

      {deleteConfirm && (
        <Modal title="Delete Combo?" onClose={() => setDeleteConfirm(false)} size="sm">
          <div className="space-y-4">
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              This cannot be undone. <strong>{combo.name}</strong> will be permanently removed.
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
