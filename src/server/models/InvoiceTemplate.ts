import 'server-only';
import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceTemplateDoc extends Document {
  restaurantName: string;
  address?: string;
  logoUrl?: string;
  footerText?: string;
  terms?: string;
  currencySymbol: string;
  updatedAt: Date;
}

const InvoiceTemplateSchema = new Schema<IInvoiceTemplateDoc>(
  {
    restaurantName: { type: String, required: true },
    address: String,
    logoUrl: String,
    footerText: String,
    terms: String,
    currencySymbol: { type: String, default: '$' },
  },
  { timestamps: true }
);

export const InvoiceTemplate =
  (mongoose.models.InvoiceTemplate as mongoose.Model<IInvoiceTemplateDoc>) ||
  mongoose.model<IInvoiceTemplateDoc>('InvoiceTemplate', InvoiceTemplateSchema);
