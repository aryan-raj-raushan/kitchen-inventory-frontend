import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { validate } from '@/server/services/coupon.server.service';

const ValidateSchema = z.object({
  code: z.string().min(1),
  orderTotal: z.number().min(0),
});

export const POST = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const body = await req.json();
    const { code, orderTotal } = validateBody(ValidateSchema, body);
    // Always return 200 to avoid leaking coupon existence
    const result = await validate(code, orderTotal);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
});
