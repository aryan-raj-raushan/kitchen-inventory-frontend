'use client';

import Link from 'next/link';
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
  if (coupons.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 text-sm">
        No coupons yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Code</th>
            <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Discount</th>
            <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Uses</th>
            <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Valid From</th>
            <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Expires</th>
            <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Status</th>
            <th className="text-right px-5 py-3.5 font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {coupons.map((c) => (
            <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3.5 font-mono font-semibold text-indigo-700">{c.code}</td>
              <td className="px-5 py-3.5 text-slate-700">
                {discountLabel(c)}{' '}
                <span className="text-slate-400 text-xs">
                  ({c.discountType === 'PERCENTAGE' ? '%' : 'fixed'})
                </span>
              </td>
              <td className="px-5 py-3.5 text-slate-600">
                {c.maxUses === 0 ? (
                  <span className="text-slate-400">Unlimited</span>
                ) : (
                  `${c.usesRemaining} / ${c.maxUses}`
                )}
              </td>
              <td className="px-5 py-3.5 text-slate-600">
                {new Date(c.startDate).toLocaleDateString()}
              </td>
              <td className="px-5 py-3.5 text-slate-600">
                {new Date(c.expiryDate).toLocaleDateString()}
              </td>
              <td className="px-5 py-3.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(c.status)}`}>
                  {c.status === 'ACTIVE' ? 'Active' : 'Deactivated'}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/coupons/${c._id}`}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onToggleStatus(c)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      c.status === 'ACTIVE'
                        ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete coupon "${c.code}"?`)) onDelete(c._id);
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
