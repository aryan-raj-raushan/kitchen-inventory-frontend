'use client';

import { useOrders } from '@/hooks/useOrders';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { IOrder } from '@/types';

export default function OrdersPage() {
  const { orders, total, page, setPage, isLoading, error, cancelOrder, downloadInvoice } =
    useOrders();

  const columns = [
    { header: 'Invoice', accessor: 'invoiceNumber' as keyof IOrder },
    { header: 'Customer', accessor: 'customerName' as keyof IOrder },
    { header: 'Phone', accessor: 'customerPhone' as keyof IOrder },
    {
      header: 'Total',
      accessor: (o: IOrder) => `$${o.total.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: (o: IOrder) => <Badge variant={o.status} />,
    },
    {
      header: 'Date',
      accessor: (o: IOrder) => new Date(o.createdAt).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (o: IOrder) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => downloadInvoice(o._id)}>
            Invoice
          </Button>
          {o.status === 'CONFIRMED' && (
            <Button size="sm" variant="danger" onClick={() => cancelOrder(o._id)}>
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Orders</h1>
        <span className="text-sm text-slate-500">{total} total</span>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table columns={columns} rows={orders} emptyMessage="No orders yet" />
          {total > 20 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600 self-center">Page {page}</span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page * 20 >= total}
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
