'use client';

import { useState } from 'react';
import { Eye, Download, X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { Modal } from '@/components/common/Modal';
import type { IOrder } from '@/types';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function OrderDetail({ order, onDownload, onCancel }: { order: IOrder; onDownload: (id: string) => void; onCancel: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-900">{order.invoiceNumber}</p>
          <p className="text-sm text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <Badge variant={order.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4 text-sm">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Customer</p>
          <p className="font-semibold text-slate-800">{order.customerName}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Phone</p>
          <p className="font-semibold text-slate-800">{order.customerPhone}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[340px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Item</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">Qty</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(order.items ?? []).map((item, i) => (
              <tr key={i} className="bg-white hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-2.5 text-slate-800 font-medium">{item.itemName}</td>
                <td className="px-4 py-2.5 text-center text-slate-600">{item.quantity}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-slate-800">₹{(item.subtotal ?? 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>₹{(order.subtotal ?? 0).toFixed(2)}</span>
        </div>
        {(order.discountAmount ?? 0) > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Discount</span>
            <span>−₹{(order.discountAmount ?? 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-2 mt-1">
          <span>Total</span>
          <span>₹{(order.total ?? 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <Button variant="secondary" className="flex-1 gap-1.5 justify-center" onClick={() => onDownload(order._id)}>
          <Download size={14} />
          Invoice PDF
        </Button>
        {order.status === 'CONFIRMED' && (
          <Button variant="danger" className="flex-1 gap-1.5 justify-center" onClick={() => onCancel(order._id)}>
            <X size={14} />
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, total, page, setPage, isLoading, error, fetchOrders, cancelOrder, downloadInvoice } =
    useOrders();
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  function handleStatusFilter(status: string) {
    setStatusFilter(status);
    fetchOrders({ status: status || undefined, page: 1 });
    setPage(1);
  }

  async function handleCancel(id: string) {
    await cancelOrder(id);
    setSelectedOrder(null);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          {!isLoading && (
            <p className="text-sm text-slate-400 mt-0.5">{total} order{total !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === f.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <ShoppingBag size={40} strokeWidth={1.25} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium">No orders found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Invoice</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">Phone</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Total</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden md:table-cell">Date</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order, i) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50/60 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{order.invoiceNumber}</td>
                    <td className="px-5 py-3.5 text-slate-700">{order.customerName}</td>
                    <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{order.customerPhone}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800">₹{(order.total ?? 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5"><Badge variant={order.status} /></td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => downloadInvoice(order._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Download invoice"
                        >
                          <Download size={15} />
                        </button>
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => cancelOrder(order._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Cancel order"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > limit && (
            <div className="flex items-center justify-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-slate-500">
                Page <strong className="text-slate-800">{page}</strong> of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {selectedOrder && (
        <Modal title="Order Details" onClose={() => setSelectedOrder(null)} size="lg">
          <OrderDetail
            order={selectedOrder}
            onDownload={(id) => { downloadInvoice(id); }}
            onCancel={handleCancel}
          />
        </Modal>
      )}
    </div>
  );
}
