import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getById, update, remove } from '@/server/services/combo.server.service';

const ComponentSchema = z.object({
  inventoryItemId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const UpdateComboSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().optional().nullable().transform((v) => v ?? undefined),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  components: z.array(ComponentSchema).min(1).optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth(async (_req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const combo = await getById(id);
    return successResponse(combo);
  } catch (err) {
    return errorResponse(err);
  }
});

export const PATCH = withAuth(async (req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = validateBody(UpdateComboSchema, body);
    const combo = await update(id, data);
    return successResponse(combo);
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
