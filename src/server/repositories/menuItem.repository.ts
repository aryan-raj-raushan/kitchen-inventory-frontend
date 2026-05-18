import 'server-only';
import mongoose from 'mongoose';
import { MenuItem, IMenuItemDoc } from '../models/MenuItem';
import type { CreateMenuItemRequest } from '@/types';

export async function findAll(): Promise<IMenuItemDoc[]> {
  return MenuItem.find().sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<IMenuItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return MenuItem.findById(id);
}

export async function create(data: CreateMenuItemRequest): Promise<IMenuItemDoc> {
  return MenuItem.create(data);
}

export async function update(
  id: string,
  data: Partial<CreateMenuItemRequest>
): Promise<IMenuItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return MenuItem.findByIdAndUpdate(id, data, { new: true });
}

export async function deactivate(id: string): Promise<IMenuItemDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return MenuItem.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
}
