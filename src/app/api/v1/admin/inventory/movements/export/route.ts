import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { errorResponse } from '@/lib/apiResponse';
import { exportAll } from '@/server/repositories/stockMovement.repository';
import type { MovementType } from '@/types';

function toCSV(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? '')).join(',')
    ),
  ];
  return lines.join('\n');
}

export const GET = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') === 'pdf' ? 'pdf' : 'csv';

    const movements = await exportAll({
      itemId: searchParams.get('itemId') ?? undefined,
      movementType: (searchParams.get('movementType') as MovementType) ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
    });

    if (format === 'csv') {
      const rows = movements.map((m) => ({
        Date: m.recordedAt,
        Type: m.movementType,
        Item: (m.inventoryItemId as any)?.name ?? m.inventoryItemId,
        Delta: m.quantityDelta,
        Notes: m.notes ?? '',
        RecordedBy: m.recordedBy,
      }));

      const csv = toCSV(rows as Array<Record<string, unknown>>);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="stock-movements-${Date.now()}.csv"`,
        },
      });
    }

    // PDF export
    const PDFDocument = (await import('pdfkit')).default;
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', resolve);
      doc.on('error', reject);

      doc.fontSize(16).font('Helvetica-Bold').text('Stock Movement Report', { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Date', 40, doc.y, { width: 100 });
      doc.text('Type', 140, doc.y - doc.currentLineHeight(), { width: 100 });
      doc.text('Item', 240, doc.y - doc.currentLineHeight(), { width: 160 });
      doc.text('Delta', 400, doc.y - doc.currentLineHeight(), { width: 60, align: 'right' });
      doc.text('Notes', 460, doc.y - doc.currentLineHeight(), { width: 100 });
      doc.moveDown(0.3);
      doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.3);

      doc.font('Helvetica').fontSize(8);
      for (const m of movements) {
        const y = doc.y;
        doc.text(new Date(m.recordedAt).toLocaleDateString(), 40, y, { width: 100 });
        doc.text(m.movementType, 140, y, { width: 100 });
        doc.text((m.inventoryItemId as any)?.name ?? String(m.inventoryItemId), 240, y, { width: 160 });
        doc.text(String(m.quantityDelta), 400, y, { width: 60, align: 'right' });
        doc.text(m.notes ?? '', 460, y, { width: 100 });
        doc.moveDown(0.4);
      }

      doc.end();
    });

    const buffer = Buffer.concat(chunks);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="stock-movements-${Date.now()}.pdf"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
});
