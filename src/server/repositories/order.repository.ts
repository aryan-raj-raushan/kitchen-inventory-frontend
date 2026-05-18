import 'server-only';
import mongoose from 'mongoose';
import { Order, IOrderDoc } from '../models/Order';

export async function create(
  data: Partial<IOrderDoc>,
  session: mongoose.ClientSession
): Promise<IOrderDoc> {
  const [order] = await Order.create([data], { session });
  return order;
}

export async function findAll(filters: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: IOrderDoc[]; total: number }> {
  const { status, page = 1, limit = 20 } = filters;
  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return { orders, total };
}

export async function findById(id: string): Promise<IOrderDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Order.findById(id);
}

export async function cancel(id: string): Promise<IOrderDoc | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Order.findByIdAndUpdate(id, { status: 'CANCELLED' }, { new: true });
}
