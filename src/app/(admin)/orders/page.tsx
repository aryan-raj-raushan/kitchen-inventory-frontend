'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { Modal } from '@/components/common/Modal';
import type { IOrder } from '@/types';

function OrderDetail({ order, onDownload }: { order: IOrder; onDownload: (id: string) => void }) {
  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-900">{order.invoiceNumber}</p>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge variant={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Customer</p>
          <p className="font-medium text-slate-800">{order.customerName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Phone</p>
          <p className="font-medium text-slate-800">{order.customerPhone}</p>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Item</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">Qty</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Price</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {order.items.map((item, i) => (
              <tr key={i} className="bg-white">
                <td className="px-4 py-2.5 text-slate-800">{item.itemName}</td>
                <td className="px-4 py-2.5 text-center text-slate-600">{item.quantity}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">₹{item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-800">
                  ₹{item.subtotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>₹{order.subtotal.toFixed(2)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Discount</span>
            <span>−₹{order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-2 mt-1">
          <span>Total</span>
          <span>₹{order.total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => onDownload(order._id)}
      >
        Download Invoice PDF
      </Button>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, total, page, setPage, isLoading, error, cancelOrder, downloadInvoice } =
    useOrders();
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const columns = [
    { header: 'Invoice', accessor: 'invoiceNumber' as keyof IOrder },
    { header: 'Customer', accessor: 'customerName' as keyof IOrder },
    { header: 'Phone', accessor: 'customerPhone' as keyof IOrder },
    {
      header: 'Total',
      accessor: (o: IOrder) => `₹${o.total.toFixed(2)}`,
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
          <Button size="sm" variant="secondary" onClick={() => setSelectedOrder(o)}>
            View
          </Button>
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
          <Table<IOrder> columns={columns} rows={orders} emptyMessage="No orders yet" />
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

      {selectedOrder && (
        <Modal
          title={`Order Details`}
          onClose={() => setSelectedOrder(null)}
        >
          <OrderDetail
            order={selectedOrder}
            onDownload={(id) => { downloadInvoice(id); setSelectedOrder(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
