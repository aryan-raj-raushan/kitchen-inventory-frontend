import 'server-only';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBrandingSnapshotDoc {
  restaurantName: string;
  address?: string;
  logoUrl?: string;
  footerText?: string;
  terms?: string;
  currencySymbol: string;
}

export interface IInvoiceDoc extends Document {
  orderId: Types.ObjectId;
  brandingSnapshot: IBrandingSnapshotDoc;
  generatedAt: Date;
}

const BrandingSnapshotSchema = new Schema<IBrandingSnapshotDoc>(
  {
    restaurantName: { type: String, required: true },
    address: String,
    logoUrl: String,
    footerText: String,
    terms: String,
    currencySymbol: { type: String, default: '$' },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoiceDoc>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', unique: true, required: true },
  brandingSnapshot: { type: BrandingSnapshotSchema, required: true },
  generatedAt: { type: Date, default: Date.now },
});

export const Invoice =
  (mongoose.models.Invoice as mongoose.Model<IInvoiceDoc>) ||
  mongoose.model<IInvoiceDoc>('Invoice', InvoiceSchema);
