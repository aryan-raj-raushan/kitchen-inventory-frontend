'use client';

import { usePOS } from '@/hooks/usePOS';
import { useCart } from '@/hooks/useCart';
import { InventoryGrid } from '@/components/pos/InventoryGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import { Modal } from '@/components/common/Modal';
import { Alert } from '@/components/common/Alert';

export default function POSPage() {
  const pos = usePOS();
  const cart = useCart();

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Point of Sale</h1>
        {cart.itemCount > 0 && (
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            {cart.itemCount} item{cart.itemCount > 1 ? 's' : ''} in cart
          </span>
        )}
      </div>

      {pos.error && <Alert variant="error" message={pos.error} />}

      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0">
        {/* Inventory grid — scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <InventoryGrid onAddItem={cart.addItem} />
        </div>

        {/* Cart — fixed width on desktop, full width on mobile */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
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

      {pos.orderResult && (
        <Modal title="Order Confirmed ✓" onClose={pos.resetOrder}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
              <p className="text-3xl font-bold text-emerald-700">{pos.orderResult.invoiceNumber}</p>
              <p className="text-sm text-emerald-600 mt-1">Order placed successfully</p>
            </div>
            <div className="text-sm text-slate-700 space-y-1.5">
              <p><span className="font-medium">Customer:</span> {pos.orderResult.customerName}</p>
              <p><span className="font-medium">Phone:</span> {pos.orderResult.customerPhone}</p>
              <p><span className="font-medium">Total:</span> ₹{pos.orderResult.total.toFixed(2)}</p>
            </div>
            <button
              onClick={pos.resetOrder}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              New Order
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
