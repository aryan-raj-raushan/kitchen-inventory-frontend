import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAvailableForPOS } from '@/server/services/inventory.server.service';

export const GET = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filters = {
      categoryId: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    };
    const items = await getAvailableForPOS(filters);
    return successResponse(items);
  } catch (err) {
    return errorResponse(err);
  }
});
