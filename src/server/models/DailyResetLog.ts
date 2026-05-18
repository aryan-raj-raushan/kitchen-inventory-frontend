import 'server-only';
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDailyResetLogDoc extends Document {
  inventoryItemId: Types.ObjectId;
  resetDate: string;
  quantityBeforeReset: number;
  confirmedQuantity?: number;
  confirmedAt?: Date;
  createdAt: Date;
}

const DailyResetLogSchema = new Schema<IDailyResetLogDoc>(
  {
    inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    resetDate: { type: String, required: true },
    quantityBeforeReset: { type: Number, required: true, min: 0 },
    confirmedQuantity: { type: Number, min: 0 },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

DailyResetLogSchema.index({ inventoryItemId: 1, resetDate: 1 }, { unique: true });
DailyResetLogSchema.index({ resetDate: 1 });

export const DailyResetLog =
  (mongoose.models.DailyResetLog as mongoose.Model<IDailyResetLogDoc>) ||
  mongoose.model<IDailyResetLogDoc>('DailyResetLog', DailyResetLogSchema);
