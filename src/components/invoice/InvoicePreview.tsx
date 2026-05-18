'use client';

import type { IInvoiceTemplate } from '@/types';

interface InvoicePreviewProps {
  template: IInvoiceTemplate | null;
}

const SAMPLE_ITEMS = [
  { name: 'Margherita Pizza', qty: 2, price: 249 },
  { name: 'Chicken Burger', qty: 1, price: 179 },
  { name: 'Cold Coffee', qty: 3, price: 89 },
];

export function InvoicePreview({ template }: InvoicePreviewProps) {
  const sym = template?.currencySymbol ?? '₹';
  const name = template?.restaurantName ?? 'My Restaurant';
  const address = template?.address ?? '123 Main Street, City';
  const footer = template?.footerText ?? 'Thank you for your visit!';
  const terms = template?.terms;
  const logoUrl = template?.logoUrl;

  const subtotal = SAMPLE_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = 50;
  const total = subtotal - discount;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-sm font-sans">
      <div className="text-center mb-5">
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="logo" className="h-12 object-contain mx-auto mb-2" />
        )}
        <p className="text-lg font-bold text-slate-900">{name}</p>
        {address && <p className="text-xs text-slate-500 mt-0.5">{address}</p>}
      </div>

      <div className="border-t border-dashed border-slate-200 pt-3 mb-3 flex justify-between text-xs text-slate-500">
        <span>Invoice #INV-0042</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-500 mb-1">Customer: <span className="text-slate-700 font-medium">John Doe</span></p>
        <p className="text-xs text-slate-500">Phone: <span className="text-slate-700 font-medium">+91 98765 43210</span></p>
      </div>

      <table className="w-full text-xs mb-3">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-1.5 font-semibold text-slate-600">Item</th>
            <th className="text-center py-1.5 font-semibold text-slate-600">Qty</th>
            <th className="text-right py-1.5 font-semibold text-slate-600">Price</th>
            <th className="text-right py-1.5 font-semibold text-slate-600">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {SAMPLE_ITEMS.map((item) => (
            <tr key={item.name}>
              <td className="py-1.5 text-slate-700">{item.name}</td>
              <td className="py-1.5 text-center text-slate-600">{item.qty}</td>
              <td className="py-1.5 text-right text-slate-600">{sym}{item.price.toFixed(2)}</td>
              <td className="py-1.5 text-right text-slate-700 font-medium">{sym}{(item.price * item.qty).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-slate-100 pt-2 space-y-1 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>{sym}{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-emerald-600">
          <span>Discount (SAVE50)</span>
          <span>−{sym}{discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-1.5 mt-1">
          <span>Total</span>
          <span>{sym}{total.toFixed(2)}</span>
        </div>
      </div>

      {(footer || terms) && (
        <div className="border-t border-dashed border-slate-200 mt-4 pt-3 text-center space-y-1">
          {footer && <p className="text-xs text-slate-500">{footer}</p>}
          {terms && <p className="text-xs text-slate-400 italic">{terms}</p>}
        </div>
      )}

      <p className="text-center text-xs text-slate-300 mt-4">— Preview only —</p>
    </div>
  );
}
