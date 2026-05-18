import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { Category } from '@/server/models/Category';
import { NotFoundError } from '@/lib/errors';

const UpdateSchema = z.object({
  name: z.string().min(1).trim(),
  description: z.string().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(async (req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const data = validateBody(UpdateSchema, body);
    const existing = await Category.findOne({ name: new RegExp(`^${data.name}$`, 'i'), _id: { $ne: id } });
    if (existing) return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
    const category = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new NotFoundError('Category not found');
    return successResponse(category);
  } catch (err) {
    return errorResponse(err);
  }
});

export const DELETE = withAuth(async (_req: NextRequest, { params }: Ctx): Promise<NextResponse> => {
  try {
    await connectDB();
    const { id } = await params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new NotFoundError('Category not found');
    return successResponse({ deleted: true });
  } catch (err) {
    return errorResponse(err);
  }
});
