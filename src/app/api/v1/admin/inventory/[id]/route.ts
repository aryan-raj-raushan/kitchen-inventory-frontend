import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { update } from '@/server/services/inventory.server.service';

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
  currentQuantity: z.number().min(0).optional(),
  minimumThreshold: z.number().min(0).optional(),
  criticalThreshold: z.number().min(0).optional(),
  parLevel: z.number().min(0).optional(),
});

export const PUT = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }>; user: unknown }): Promise<NextResponse> => {
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
  }
);
