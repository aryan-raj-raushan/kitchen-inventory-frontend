import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getById, update, deactivate } from '@/server/services/inventory.server.service';

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
  price: z.number().min(0).optional(),
  currentQuantity: z.number().min(0).optional(),
  dailyReset: z.boolean().optional(),
  imageUrl: z.string().optional().nullable().transform((v) => v ?? undefined),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const GET = withAuth(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    try {
      await connectDB();
      const { id } = await params;
      const item = await getById(id);
      return successResponse(item);
    } catch (err) {
      return errorResponse(err);
    }
  }
);

export const PATCH = withAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
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

export const DELETE = withAuth(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    try {
      await connectDB();
      const { id } = await params;
      await deactivate(id);
      return new NextResponse(null, { status: 204 });
    } catch (err) {
      return errorResponse(err);
    }
  }
);
