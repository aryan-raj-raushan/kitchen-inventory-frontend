import 'server-only';
import mongoose from 'mongoose';
import { Combo, IComboDoc } from '../models/Combo';

export async function findAll(filters?: { status?: string }): Promise<IComboDoc[]> {
  const query: Record<string, unknown> = {};
  if (filters?.status) query.status = filters.status;
  return Combo.find(query).sort({ name: 1 });
}

export async function findById(id: string): Promise<IComboDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Combo.findById(id);
}

export async function findBySlug(slug: string): Promise<IComboDoc | null> {
  return Combo.findOne({ slug });
}

export async function findActive(): Promise<IComboDoc[]> {
  return Combo.find({ status: 'ACTIVE' }).sort({ name: 1 });
}

export async function create(data: {
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  components: Array<{ inventoryItemId: string; itemName: string; quantity: number }>;
}): Promise<IComboDoc> {
  return Combo.create(data);
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE';
    components: Array<{ inventoryItemId: string; itemName: string; quantity: number }>;
  }>
): Promise<IComboDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Combo.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function remove(id: string): Promise<IComboDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Combo.findByIdAndDelete(id);
}
