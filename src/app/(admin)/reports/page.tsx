'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, ShoppingBag, RotateCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { Table } from '@/components/common/Table';
import type { IStockMovement, MovementType } from '@/types';

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: 'MANUAL_IN', label: 'Stock In' },
  { value: 'MANUAL_OUT', label: 'Stock Out' },
  { value: 'ORDER_DEDUCTION', label: 'Order' },
  { value: 'DAILY_RESET', label: 'Daily Reset' },
];

const TYPE_META: Record<MovementType, { label: string; color: string; icon: React.ReactNode }> = {
  MANUAL_IN:       { label: 'Stock In',    color: '#10b981', icon: <TrendingUp size={14} className="text-emerald-500" /> },
  MANUAL_OUT:      { label: 'Stock Out',   color: '#f97316', icon: <TrendingDown size={14} className="text-orange-500" /> },
  ORDER_DEDUCTION: { label: 'Orders',      color: '#6366f1', icon: <ShoppingBag size={14} className="text-indigo-500" /> },
  DAILY_RESET:     { label: 'Daily Reset', color: '#8b5cf6', icon: <RotateCcw size={14} className="text-violet-500" /> },
};

const inputClass =
  'rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { movements, total, filters, isLoading, isExporting, error, updateFilter, setPage, exportReport } =
    useReports();

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  // Derived stats from loaded movements
  const stats = useMemo(() => {
    const stockIn = movements.filter((m) => m.movementType === 'MANUAL_IN');
    const stockOut = movements.filter((m) => m.movementType === 'MANUAL_OUT');
    const orders = movements.filter((m) => m.movementType === 'ORDER_DEDUCTION');
    const resets = movements.filter((m) => m.movementType === 'DAILY_RESET');

    return {
      totalIn: stockIn.reduce((s, m) => s + m.quantityDelta, 0),
      totalOut: Math.abs(stockOut.reduce((s, m) => s + m.quantityDelta, 0)),
      totalOrders: orders.length,
      totalResets: resets.length,
      countIn: stockIn.length,
      countOut: stockOut.length,
    };
  }, [movements]);

  // Bar chart data — movement type breakdown
  const typeBreakdown = useMemo(() => {
    const counts: Record<MovementType, number> = {
      MANUAL_IN: 0, MANUAL_OUT: 0, ORDER_DEDUCTION: 0, DAILY_RESET: 0,
    };
    movements.forEach((m) => { counts[m.movementType]++; });
    return Object.entries(counts).map(([type, count]) => ({
      name: TYPE_META[type as MovementType].label,
      count,
      color: TYPE_META[type as MovementType].color,
    }));
  }, [movements]);

  // Area chart data — movements by day
  const timelineData = useMemo(() => {
    const byDay: Record<string, { in: number; out: number; orders: number }> = {};
    movements.forEach((m) => {
      const day = new Date(m.recordedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!byDay[day]) byDay[day] = { in: 0, out: 0, orders: 0 };
      if (m.movementType === 'MANUAL_IN') byDay[day].in += m.quantityDelta;
      if (m.movementType === 'MANUAL_OUT') byDay[day].out += Math.abs(m.quantityDelta);
      if (m.movementType === 'ORDER_DEDUCTION') byDay[day].orders += Math.abs(m.quantityDelta);
    });
    return Object.entries(byDay)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([day, vals]) => ({ day, ...vals }));
  }, [movements]);

  // Top items by movement volume
  const topItems = useMemo(() => {
    const byItem: Record<string, { name: string; volume: number }> = {};
    movements.forEach((m) => {
      const name = m.inventoryItemName ?? '—';
      if (!byItem[name]) byItem[name] = { name, volume: 0 };
      byItem[name].volume += Math.abs(m.quantityDelta);
    });
    return Object.values(byItem).sort((a, b) => b.volume - a.volume).slice(0, 6);
  }, [movements]);

  const columns = [
    {
      header: 'Date',
      accessor: (m: IStockMovement) => (
        <span className="text-slate-500 text-xs">{new Date(m.recordedAt).toLocaleString()}</span>
      ),
    },
    {
      header: 'Type',
      accessor: (m: IStockMovement) => (
        <div className="flex items-center gap-1.5">
          {TYPE_META[m.movementType].icon}
          <Badge variant={m.movementType} />
        </div>
      ),
    },
    {
      header: 'Item',
      accessor: (m: IStockMovement) => {
        if (m.inventoryItemName) return <span className="font-medium text-slate-800">{m.inventoryItemName}</span>;
        const id = m.inventoryItemId;
        if (typeof id === 'object' && id !== null) {
          return <span className="font-medium text-slate-800">{(id as unknown as { name?: string })?.name ?? '—'}</span>;
        }
        return <span className="text-slate-400">—</span>;
      },
    },
    {
      header: 'Delta',
      accessor: (m: IStockMovement) => (
        <span className={`font-semibold flex items-center gap-1 ${m.quantityDelta > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {m.quantityDelta > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {m.quantityDelta > 0 ? '+' : ''}{m.quantityDelta}
        </span>
      ),
    },
    {
      header: 'Notes',
      accessor: (m: IStockMovement) => (
        <span className="text-slate-400 text-xs">{m.notes ?? '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          {!isLoading && (
            <p className="text-sm text-slate-400 mt-0.5">{total} movement{total !== 1 ? 's' : ''} total</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" loading={isExporting} onClick={() => exportReport('csv')} className="gap-1.5">
            <Download size={13} /> CSV
          </Button>
          <Button size="sm" variant="secondary" loading={isExporting} onClick={() => exportReport('pdf')} className="gap-1.5">
            <Download size={13} /> PDF
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      {!isLoading && movements.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Stock In Volume"
            value={stats.totalIn}
            sub={`${stats.countIn} movements`}
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            accent="bg-emerald-50"
          />
          <StatCard
            label="Stock Out Volume"
            value={stats.totalOut}
            sub={`${stats.countOut} movements`}
            icon={<TrendingDown size={18} className="text-orange-500" />}
            accent="bg-orange-50"
          />
          <StatCard
            label="Order Deductions"
            value={stats.totalOrders}
            sub="confirmed orders"
            icon={<ShoppingBag size={18} className="text-indigo-500" />}
            accent="bg-indigo-50"
          />
          <StatCard
            label="Daily Resets"
            value={stats.totalResets}
            sub="reset events"
            icon={<RotateCcw size={18} className="text-violet-500" />}
            accent="bg-violet-50"
          />
        </div>
      )}

      {/* Charts row */}
      {!isLoading && movements.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Timeline area chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-800 mb-4">Activity Timeline</p>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timelineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="in" name="Stock In" stroke="#10b981" strokeWidth={2} fill="url(#gradIn)" />
                  <Area type="monotone" dataKey="out" name="Stock Out" stroke="#f97316" strokeWidth={2} fill="url(#gradOut)" />
                  <Area type="monotone" dataKey="orders" name="Orders" stroke="#6366f1" strokeWidth={2} fill="url(#gradOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No timeline data</div>
            )}
            <div className="flex gap-4 mt-3 flex-wrap">
              {[{ color: '#10b981', label: 'Stock In' }, { color: '#f97316', label: 'Stock Out' }, { color: '#6366f1', label: 'Orders' }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Movement type donut */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-slate-800 mb-4">By Type</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={typeBreakdown.filter((d) => d.count > 0)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={75}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {typeBreakdown.filter((d) => d.count > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {typeBreakdown.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </div>
                  <span className="font-semibold text-slate-800">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top items bar chart */}
      {!isLoading && topItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-slate-800 mb-4">Top Items by Movement Volume</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topItems} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" name="Volume" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {topItems.map((_, i) => (
                  <Cell key={i} fill={`hsl(${243 - i * 15}, 80%, ${62 + i * 4}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-end">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500">Movement Type</label>
          <select
            className={`${inputClass} w-full sm:w-auto`}
            value={filters.movementType ?? ''}
            onChange={(e) => updateFilter({ movementType: (e.target.value as MovementType) || undefined })}
          >
            <option value="">All Types</option>
            {MOVEMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500">From</label>
          <input
            type="date"
            className={`${inputClass} w-full sm:w-auto`}
            value={filters.from ?? ''}
            onChange={(e) => updateFilter({ from: e.target.value || undefined })}
          />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500">To</label>
          <input
            type="date"
            className={`${inputClass} w-full sm:w-auto`}
            value={filters.to ?? ''}
            onChange={(e) => updateFilter({ to: e.target.value || undefined })}
          />
        </div>
        {(filters.movementType || filters.from || filters.to) && (
          <button
            onClick={() => updateFilter({ movementType: undefined, from: undefined, to: undefined })}
            className="text-xs text-indigo-600 hover:underline sm:self-end sm:pb-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table<IStockMovement> columns={columns} rows={movements} emptyMessage="No movements found" />
          {total > limit && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page <strong className="text-slate-800">{page}</strong> of {Math.ceil(total / limit)}
              </span>
              <Button size="sm" variant="secondary" disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
