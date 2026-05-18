import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getById, update, deactivate, remove } from '@/server/services/inventory.server.service';

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().min(0).optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).nullish(),
  discountValue: z.number().min(0).optional(),
  currentQuantity: z.number().min(0).optional(),
  dailyReset: z.boolean().optional(),
  imageUrl: z.string().optional().nullable().transform((v) => v ?? undefined),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const item = await getById(id);
    return successResponse(item);
  } catch (err) {
    return errorResponse(err);
  }
});

export const PATCH = withAuth(async (req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = validateBody(UpdateSchema, body);
    const item = await update(id, data);
    return successResponse(item);
  } catch (err) {
    return errorResponse(err);
  }
});

// PATCH /deactivate — soft delete (set status INACTIVE)
export const PUT = withAuth(async (_req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const item = await deactivate(id);
    return successResponse(item);
  } catch (err) {
    return errorResponse(err);
  }
});

// DELETE — permanent hard delete
export const DELETE = withAuth(async (_req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    await remove(id);
    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse(err);
  }
});
