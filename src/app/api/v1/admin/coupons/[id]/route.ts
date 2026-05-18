import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { update } from '@/server/services/coupon.server.service';

const UpdateCouponSchema = z.object({
  discountValue: z.number().min(0).optional(),
  maxUses: z.number().int().min(1).optional(),
  expiryDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'DEACTIVATED']).optional(),
});

export const PUT = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }>; user: unknown }): Promise<NextResponse> => {
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
  }
);
