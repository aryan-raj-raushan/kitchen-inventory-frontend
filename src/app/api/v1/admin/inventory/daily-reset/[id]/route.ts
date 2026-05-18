import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { confirmDailyQuantity } from '@/server/services/dailyReset.server.service';

const Schema = z.object({
  quantity: z.number().min(0),
});

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    try {
      await connectDB();
      const { id } = await params;
      const body = await req.json();
      const { quantity } = validateBody(Schema, body);
      const result = await confirmDailyQuantity(id, quantity);
      return successResponse(result);
    } catch (err) {
      return errorResponse(err);
    }
  }
);
