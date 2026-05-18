import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAll, create } from '@/server/services/menuItem.server.service';

const CreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  price: z.number().min(0),
  inventoryItemId: z.string().min(1),
});

export const GET = withAuth(async (_req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const items = await getAll();
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
