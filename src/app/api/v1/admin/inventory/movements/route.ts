import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { findAll } from '@/server/repositories/stockMovement.repository';
import type { MovementFilters, MovementType } from '@/types';

export const GET = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filters: MovementFilters = {
      itemId: searchParams.get('itemId') ?? undefined,
      movementType: (searchParams.get('movementType') as MovementType) ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    };
    const result = await findAll(filters);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
});
