'use client';

import Link from 'next/link';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import { useCombos } from '@/hooks/useCombos';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { ICombo } from '@/types';
import { useState } from 'react';

function DeleteConfirmModal({ combo, onConfirm, onClose }: { combo: ICombo; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-overlay">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl animate-slide-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={16} className="text-red-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Delete Combo?</h2>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          <strong className="text-slate-800">{combo.name}</strong> will be permanently deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CombosPage() {
  const { combos, isLoading, error, deleteCombo, toggleStatus } = useCombos();
  const [deleteTarget, setDeleteTarget] = useState<ICombo | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Combos & Thalis</h1>
          {!isLoading && (
            <p className="text-sm text-slate-400 mt-0.5">{combos.length} combo{combos.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <Link
          href="/combos/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Combo
        </Link>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : combos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Layers size={24} className="text-indigo-300" />
          </div>
          <p className="text-slate-500 font-medium">No combos yet</p>
          <p className="text-slate-400 text-sm mt-1">Create a thali or combo to bundle items for POS.</p>
          <Link href="/combos/new" className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
            <Plus size={14} /> Create your first combo
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Price</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600 hidden sm:table-cell">Components</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {combos.map((combo, i) => (
                <tr
                  key={combo._id}
                  className="hover:bg-slate-50/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{combo.name}</p>
                    {combo.description && <p className="text-xs text-slate-400 mt-0.5">{combo.description}</p>}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-indigo-600">₹{combo.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {combo.components.map((c, ci) => (
                        <span key={ci} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                          {c.itemName} ×{c.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      combo.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {combo.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/combos/${combo.slug ?? combo._id}`}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </Link>
                      <button
                        onClick={() => toggleStatus(combo)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          combo.status === 'ACTIVE'
                            ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={combo.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        {combo.status === 'ACTIVE' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(combo)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          combo={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteCombo(deleteTarget._id);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
