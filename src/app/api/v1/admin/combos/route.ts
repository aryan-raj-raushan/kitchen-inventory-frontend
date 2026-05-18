import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAll, create } from '@/server/services/combo.server.service';

const ComponentSchema = z.object({
  inventoryItemId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const CreateComboSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  components: z.array(ComponentSchema).min(1),
});

export const GET = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;
    const combos = await getAll({ status });
    return successResponse(combos);
  } catch (err) {
    return errorResponse(err);
  }
});

export const POST = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const body = await req.json();
    const data = validateBody(CreateComboSchema, body);
    const combo = await create(data);
    return successResponse(combo, 201);
  } catch (err) {
    return errorResponse(err);
  }
});
