import 'server-only';
import mongoose, { Document, Schema, Types } from 'mongoose';
import { slugify } from '@/lib/slugify';

export interface IComboDoc extends Document {
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  components: Array<{
    inventoryItemId: Types.ObjectId;
    itemName: string;
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ComboSchema = new Schema<IComboDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
    description: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    components: [
      {
        inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

ComboSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    const base = slugify(this.name);
    let candidate = base;
    let suffix = 1;
    while (
      await (this.constructor as mongoose.Model<IComboDoc>).findOne({
        slug: candidate,
        _id: { $ne: this._id },
      })
    ) {
      candidate = `${base}-${suffix++}`;
    }
    this.slug = candidate;
  }
});

export const Combo =
  (mongoose.models.Combo as mongoose.Model<IComboDoc>) ||
  mongoose.model<IComboDoc>('Combo', ComboSchema);
