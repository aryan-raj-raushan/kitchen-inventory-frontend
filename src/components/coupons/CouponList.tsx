'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { ICoupon } from '@/types';

interface CouponListProps {
  coupons: ICoupon[];
  onToggleStatus: (coupon: ICoupon) => void;
  onDelete: (id: string) => void;
}

function statusBadge(status: string) {
  return status === 'ACTIVE'
    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    : 'bg-slate-100 text-slate-500 border border-slate-200';
}

function discountLabel(coupon: ICoupon) {
  return coupon.discountType === 'PERCENTAGE'
    ? `${coupon.discountValue}%`
    : `₹${coupon.discountValue.toFixed(2)}`;
}

export function CouponList({ coupons, onToggleStatus, onDelete }: CouponListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ICoupon | null>(null);

  if (coupons.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm animate-fade-in">
        No coupons yet. Create one to get started.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Code</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Discount</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 hidden sm:table-cell">Uses</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Valid From</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600 hidden md:table-cell">Expires</th>
              <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Status</th>
              <th className="text-right px-5 py-3.5 font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {coupons.map((c, i) => (
              <tr
                key={c._id}
                className="hover:bg-slate-50/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="px-5 py-3.5 font-mono font-semibold text-indigo-700">{c.code}</td>
                <td className="px-5 py-3.5 text-slate-700">
                  {discountLabel(c)}{' '}
                  <span className="text-slate-400 text-xs">
                    ({c.discountType === 'PERCENTAGE' ? '%' : 'fixed'})
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-600 hidden sm:table-cell">
                  {c.maxUses === 0 ? (
                    <span className="text-slate-400">Unlimited</span>
                  ) : (
                    `${c.usesRemaining} / ${c.maxUses}`
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell">
                  {new Date(c.startDate).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5 text-slate-600 hidden md:table-cell">
                  {new Date(c.expiryDate).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(c.status)}`}>
                    {c.status === 'ACTIVE' ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/coupons/${c.code}`}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </Link>
                    <button
                      onClick={() => onToggleStatus(c)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        c.status === 'ACTIVE'
                          ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    >
                      {c.status === 'ACTIVE' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
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

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-overlay">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl animate-slide-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={16} className="text-red-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Delete Coupon?</h2>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              Coupon <strong className="font-mono text-indigo-700">{deleteTarget.code}</strong> will be permanently deleted and cannot be recovered.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteTarget._id);
                  setDeleteTarget(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
