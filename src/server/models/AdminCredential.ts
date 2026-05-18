import 'server-only';
import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminCredentialDoc extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const AdminCredentialSchema = new Schema<IAdminCredentialDoc>({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AdminCredential =
  (mongoose.models.AdminCredential as mongoose.Model<IAdminCredentialDoc>) ||
  mongoose.model<IAdminCredentialDoc>('AdminCredential', AdminCredentialSchema);
