import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getOrder, cancelOrder } from '@/server/services/order.server.service';

export const GET = withAuth(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }>; user: unknown }): Promise<NextResponse> => {
    try {
      await connectDB();
      const { id } = await params;
      const order = await getOrder(id);
      return successResponse(order);
    } catch (err) {
      return errorResponse(err);
    }
  }
);

export const DELETE = withAuth(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }>; user: unknown }): Promise<NextResponse> => {
    try {
      await connectDB();
      const { id } = await params;
      const order = await cancelOrder(id);
      return successResponse(order);
    } catch (err) {
      return errorResponse(err);
    }
  }
);
