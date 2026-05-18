'use client';

type BadgeVariant =
  | 'OK'
  | 'OUT_OF_STOCK'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'DEACTIVATED'
  | 'MANUAL_IN'
  | 'MANUAL_OUT'
  | 'ORDER_DEDUCTION'
  | 'DAILY_RESET'
  | 'PERCENTAGE'
  | 'FIXED_AMOUNT'
  | 'EXPIRED';

const variantClasses: Record<BadgeVariant, string> = {
  OK: 'bg-emerald-100 text-emerald-700',
  OUT_OF_STOCK: 'bg-slate-100 text-slate-500',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
  DEACTIVATED: 'bg-slate-100 text-slate-500',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-500',
  MANUAL_IN: 'bg-emerald-100 text-emerald-700',
  MANUAL_OUT: 'bg-orange-100 text-orange-700',
  ORDER_DEDUCTION: 'bg-blue-100 text-blue-700',
  DAILY_RESET: 'bg-violet-100 text-violet-700',
  PERCENTAGE: 'bg-slate-100 text-slate-600',
  FIXED_AMOUNT: 'bg-slate-100 text-slate-600',
  EXPIRED: 'bg-red-100 text-red-600',
};

const labels: Partial<Record<BadgeVariant, string>> = {
  OUT_OF_STOCK: 'Out of Stock',
  ORDER_DEDUCTION: 'Order',
  DAILY_RESET: 'Daily Reset',
  MANUAL_IN: 'Stock In',
  MANUAL_OUT: 'Stock Out',
  FIXED_AMOUNT: 'Fixed',
  PERCENTAGE: '%',
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {labels[variant] ?? variant}
    </span>
  );
}
