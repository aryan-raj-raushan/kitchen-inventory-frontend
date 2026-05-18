'use client';

import { usePOS } from '@/hooks/usePOS';
import { useCart } from '@/hooks/useCart';
import { MenuGrid } from '@/components/pos/MenuGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import { Modal } from '@/components/common/Modal';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';

export default function POSPage() {
  const pos = usePOS();
  const cart = useCart();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Point of Sale</h1>
        {cart.itemCount > 0 && (
          <span className="text-sm text-slate-500">{cart.itemCount} item(s) in cart</span>
        )}
      </div>

      {pos.error && <Alert variant="error" message={pos.error} />}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Menu area — 60% desktop */}
        <div className="flex-1 md:w-3/5">
          {pos.isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <MenuGrid items={pos.menuItems} onSelectItem={cart.addMenuItem} />
          )}
        </div>

        {/* Cart area — 40% desktop */}
        <div className="md:w-2/5 lg:w-1/3 min-h-96">
          <CartPanel
            items={cart.items}
            subtotal={pos.subtotal}
            discountAmount={pos.discountAmount}
            total={pos.total}
            couponResult={pos.couponResult}
            isValidatingCoupon={pos.isValidatingCoupon}
            isConfirming={pos.isConfirming}
            onApplyCoupon={pos.applyCoupon}
            onUpdateQty={cart.updateQuantity}
            onRemove={cart.removeItem}
            onConfirm={pos.confirmOrder}
          />
        </div>
      </div>

      {/* Order confirmed modal */}
      {pos.orderResult && (
        <Modal title="Order Confirmed" onClose={pos.resetOrder}>
          <div className="space-y-3">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{pos.orderResult.invoiceNumber}</p>
              <p className="text-sm text-green-600 mt-1">Order confirmed successfully</p>
            </div>
            <div className="text-sm text-slate-700 space-y-1">
              <p><span className="font-medium">Customer:</span> {pos.orderResult.customerName}</p>
              <p><span className="font-medium">Phone:</span> {pos.orderResult.customerPhone}</p>
              <p><span className="font-medium">Total:</span> ${pos.orderResult.total.toFixed(2)}</p>
            </div>
            <button
              onClick={pos.resetOrder}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              New Order
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
