import 'server-only';
import mongoose from 'mongoose';
import { Order } from '../models/Order';

export async function generateInvoiceNumber(
  session: mongoose.ClientSession
): Promise<string> {
  const last = await Order.findOne({}, 'invoiceNumber', {
    sort: { createdAt: -1 },
    session,
  });

  let nextNum = 1;
  if (last?.invoiceNumber) {
    const match = last.invoiceNumber.match(/INV-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `INV-${String(nextNum).padStart(4, '0')}`;
}
