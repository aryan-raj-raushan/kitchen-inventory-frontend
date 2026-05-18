import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { checkAndTriggerReset } from '@/server/services/dailyReset.server.service';

export const GET = withAuth(async (): Promise<NextResponse> => {
  try {
    await connectDB();
    const result = await checkAndTriggerReset();
    return successResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
});
