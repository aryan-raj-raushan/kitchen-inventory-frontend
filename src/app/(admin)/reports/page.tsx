'use client';

import { useReports } from '@/hooks/useReports';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { IStockMovement, MovementType } from '@/types';

const MOVEMENT_TYPES: MovementType[] = ['MANUAL_IN', 'MANUAL_OUT', 'ORDER_DEDUCTION', 'DAILY_RESET'];

export default function ReportsPage() {
  const { movements, total, filters, isLoading, isExporting, error, updateFilter, setPage, exportReport } =
    useReports();

  const columns = [
    {
      header: 'Date',
      accessor: (m: IStockMovement) => new Date(m.recordedAt).toLocaleDateString(),
    },
    {
      header: 'Type',
      accessor: (m: IStockMovement) => <Badge variant={m.movementType} />,
    },
    {
      header: 'Item',
      accessor: (m: IStockMovement) => m.inventoryItemName ?? m.inventoryItemId,
    },
    {
      header: 'Delta',
      accessor: (m: IStockMovement) => (
        <span className={m.quantityDelta > 0 ? 'text-green-600' : 'text-red-600'}>
          {m.quantityDelta > 0 ? '+' : ''}{m.quantityDelta}
        </span>
      ),
    },
    { header: 'Notes', accessor: 'notes' as keyof IStockMovement },
  ];

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Stock Movement Reports</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" loading={isExporting} onClick={() => exportReport('csv')}>
            Export CSV
          </Button>
          <Button size="sm" variant="secondary" loading={isExporting} onClick={() => exportReport('pdf')}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.movementType ?? ''}
          onChange={(e) => updateFilter({ movementType: (e.target.value as MovementType) || undefined })}
        >
          <option value="">All Types</option>
          {MOVEMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="date"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.from ?? ''}
          onChange={(e) => updateFilter({ from: e.target.value || undefined })}
        />
        <input
          type="date"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.to ?? ''}
          onChange={(e) => updateFilter({ to: e.target.value || undefined })}
        />
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table columns={columns} rows={movements} emptyMessage="No movements found" />
          {total > limit && (
            <div className="mt-4 flex justify-center gap-2">
              <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-600 self-center">Page {page} of {Math.ceil(total / limit)}</span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page * limit >= total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
