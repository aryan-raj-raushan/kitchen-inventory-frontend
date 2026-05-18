import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { createOrder, getOrders } from '@/server/services/order.server.service';

const CreateOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export const POST = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const body = await req.json();
    const data = validateBody(CreateOrderSchema, body);
    const order = await createOrder(data);
    return successResponse(order, 201);
  } catch (err) {
    return errorResponse(err);
  }
});

export const GET = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    };
    const result = await getOrders(filters);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
});
