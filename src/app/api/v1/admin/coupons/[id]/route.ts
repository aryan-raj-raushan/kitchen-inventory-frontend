import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getById, update, remove } from '@/server/services/coupon.server.service';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const UpdateCouponSchema = z.object({
  discountValue: z.number().min(0).optional(),
  startDate: dateString.optional(),
  expiryDate: dateString.optional(),
  maxUses: z.number().int().min(0).optional(),
  status: z.enum(['ACTIVE', 'DEACTIVATED']).optional(),
});

type Ctx = { params: Promise<{ id: string }>; user: unknown };

export const GET = withAuth(async (_req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const coupon = await getById(id);
    return successResponse(coupon);
  } catch (err) {
    return errorResponse(err);
  }
});

export const PATCH = withAuth(async (req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = validateBody(UpdateCouponSchema, body);
    const coupon = await update(id, data);
    return successResponse(coupon);
  } catch (err) {
    return errorResponse(err);
  }
});

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
