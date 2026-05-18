import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { Category } from '@/server/models/Category';

const CreateSchema = z.object({
  name: z.string().min(1).trim(),
  description: z.string().optional(),
});

export const GET = withAuth(async (): Promise<NextResponse> => {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return successResponse(categories);
  } catch (err) {
    return errorResponse(err);
  }
});

export const POST = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const body = await req.json();
    const data = validateBody(CreateSchema, body);
    const existing = await Category.findOne({ name: new RegExp(`^${data.name}$`, 'i') });
    if (existing) return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    const category = await Category.create(data);
    return successResponse(category, 201);
  } catch (err) {
    return errorResponse(err);
  }
});
