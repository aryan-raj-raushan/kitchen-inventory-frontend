import 'server-only';
import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryDoc extends Document {
  name: string;
  description?: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategoryDoc>({
  name: { type: String, unique: true, required: true, trim: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

export const Category =
  (mongoose.models.Category as mongoose.Model<ICategoryDoc>) ||
  mongoose.model<ICategoryDoc>('Category', CategorySchema);
