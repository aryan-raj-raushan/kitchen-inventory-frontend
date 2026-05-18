import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAll, create } from '@/server/services/inventory.server.service';

const CreateSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  unit: z.string().min(1),
  price: z.number().min(0),
  currentQuantity: z.number().min(0),
  dailyReset: z.boolean().default(false),
  imageUrl: z.string().optional(),
});

export const GET = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') ?? undefined,
      categoryId: searchParams.get('category') ?? undefined,
    };
    const items = await getAll(filters);
    return successResponse(items);
  } catch (err) {
    return errorResponse(err);
  }
});

export const POST = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const body = await req.json();
    const data = validateBody(CreateSchema, body);
    const item = await create(data);
    return successResponse(item, 201);
  } catch (err) {
    return errorResponse(err);
  }
});
