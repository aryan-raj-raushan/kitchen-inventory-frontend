import 'server-only';
import mongoose from 'mongoose';
import { Invoice, IInvoiceDoc } from '../models/Invoice';
import { InvoiceTemplate, IInvoiceTemplateDoc } from '../models/InvoiceTemplate';

export async function create(
  data: Partial<IInvoiceDoc>,
  session?: mongoose.ClientSession
): Promise<IInvoiceDoc> {
  const [invoice] = await Invoice.create([data], { session });
  return invoice;
}

export async function findByOrderId(orderId: string): Promise<IInvoiceDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return null;
  return Invoice.findOne({ orderId });
}

export async function getTemplate(): Promise<IInvoiceTemplateDoc | null> {
  return InvoiceTemplate.findOne().sort({ _id: 1 });
}

export async function upsertTemplate(data: Partial<IInvoiceTemplateDoc>): Promise<IInvoiceTemplateDoc> {
  const template = await InvoiceTemplate.findOne().sort({ _id: 1 });
  if (template) {
    Object.assign(template, data);
    return template.save();
  }
  return InvoiceTemplate.create(data);
}
