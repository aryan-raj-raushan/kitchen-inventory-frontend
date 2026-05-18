import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { dailyReset } from '@/server/services/inventory.server.service';
import { ValidationError } from '@/lib/errors';

const ResetSchema = z.object({
  confirm: z.literal(true),
});

export const POST = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const body = await req.json();
    validateBody(ResetSchema, body);
    const result = await dailyReset();
    return successResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
});
