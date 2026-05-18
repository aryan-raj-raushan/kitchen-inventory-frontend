import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAll, create } from '@/server/services/coupon.server.service';

const CreateCouponSchema = z.object({
  code: z.string().min(1),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0),
  maxUses: z.number().int().min(1),
  expiryDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

export const GET = withAuth(async (): Promise<NextResponse> => {
  try {
    await connectDB();
    const coupons = await getAll();
    return successResponse(coupons);
  } catch (err) {
    return errorResponse(err);
  }
});

export const POST = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const body = await req.json();
    const data = validateBody(CreateCouponSchema, body);
    const coupon = await create(data);
    return successResponse(coupon, 201);
  } catch (err) {
    return errorResponse(err);
  }
});
