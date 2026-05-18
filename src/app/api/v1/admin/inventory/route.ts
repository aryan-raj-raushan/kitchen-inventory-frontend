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
  currentQuantity: z.number().min(0),
  minimumThreshold: z.number().min(0),
  criticalThreshold: z.number().min(0),
  parLevel: z.number().min(0),
});

export const GET = withAuth(async (): Promise<NextResponse> => {
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
