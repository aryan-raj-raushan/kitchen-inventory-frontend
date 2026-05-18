import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { validateBody } from '@/lib/validate';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getTemplate, updateTemplate } from '@/server/services/invoice.server.service';

const UpdateTemplateSchema = z.object({
  restaurantName: z.string().min(1),
  address: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  footerText: z.string().optional(),
  terms: z.string().optional(),
  currencySymbol: z.string().min(1).max(3),
});

export const GET = withAuth(async (): Promise<NextResponse> => {
  try {
    await connectDB();
    const template = await getTemplate();
    return successResponse(template);
  } catch (err) {
    return errorResponse(err);
  }
});

export const PUT = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const body = await req.json();
    const data = validateBody(UpdateTemplateSchema, body);
    const template = await updateTemplate(data);
    return successResponse(template);
  } catch (err) {
    return errorResponse(err);
  }
});
