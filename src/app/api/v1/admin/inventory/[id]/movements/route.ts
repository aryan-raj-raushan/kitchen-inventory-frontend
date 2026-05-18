import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { recordManualMovement } from '@/server/services/inventory.server.service';

const MovementSchema = z.object({
  movementType: z.enum(['MANUAL_IN', 'MANUAL_OUT']),
  quantityDelta: z.number().min(1),
  notes: z.string().optional(),
});

export const POST = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }>; user: unknown }): Promise<NextResponse> => {
    try {
      await connectDB();
      const { id } = await params;
      const body = await req.json();
      const data = validateBody(MovementSchema, body);
      const result = await recordManualMovement(id, data);
      return successResponse(result);
    } catch (err) {
      return errorResponse(err);
    }
  }
);
