import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getPublicMenu } from '@/server/services/menu.server.service';

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const items = await getPublicMenu();
    return successResponse(items);
  } catch (err) {
    return errorResponse(err);
  }
}
