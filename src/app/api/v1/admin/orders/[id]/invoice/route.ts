import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { errorResponse } from '@/lib/apiResponse';
import { generatePDF } from '@/server/services/invoice.server.service';
import { Order } from '@/server/models/Order';

export const GET = withAuth(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }>; user: unknown }): Promise<NextResponse> => {
    try {
      await connectDB();
      const { id } = await params;
      const order = await Order.findById(id);
      const filename = order ? `${order.invoiceNumber}.pdf` : `INV-${id}.pdf`;

      const buffer = await generatePDF(id);

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(buffer.length),
        },
      });
    } catch (err) {
      return errorResponse(err);
    }
  }
);
