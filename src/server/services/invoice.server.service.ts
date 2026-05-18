import 'server-only';
import PDFDocument from 'pdfkit';
import { Order } from '../models/Order';
import * as invoiceRepo from '../repositories/invoice.repository';
import { NotFoundError } from '@/lib/errors';
import type { UpdateInvoiceTemplateRequest } from '@/types';

export async function generatePDF(orderId: string): Promise<Buffer> {
  const order = await Order.findById(orderId);
  if (!order) throw new NotFoundError('Order not found');

  const invoice = await invoiceRepo.findByOrderId(orderId);
  const branding = invoice?.brandingSnapshot ?? {
    restaurantName: 'My Restaurant',
    currencySymbol: '$',
  };

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ──────────────────────────────────────────────────
    doc.fontSize(20).font('Helvetica-Bold').text(branding.restaurantName, { align: 'center' });
    if (branding.address) {
      doc.fontSize(10).font('Helvetica').text(branding.address, { align: 'center' });
    }
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
    doc.moveDown(1);

    // ── Invoice details ──────────────────────────────────────────
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice #: ${order.invoiceNumber}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${order.customerName}`);
    doc.text(`Phone: ${order.customerPhone}`);
    doc.moveDown(1);

    // ── Line items table ─────────────────────────────────────────
    const sym = branding.currencySymbol ?? '$';
    doc.font('Helvetica-Bold').text('Item', 50, doc.y, { width: 250 });
    doc.text('Qty', 300, doc.y - doc.currentLineHeight(), { width: 60, align: 'right' });
    doc.text('Unit', 360, doc.y - doc.currentLineHeight(), { width: 80, align: 'right' });
    doc.text('Subtotal', 440, doc.y - doc.currentLineHeight(), { width: 90, align: 'right' });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica');
    for (const item of order.items) {
      const y = doc.y;
      doc.text(item.menuItemName, 50, y, { width: 250 });
      doc.text(String(item.quantity), 300, y, { width: 60, align: 'right' });
      doc.text(`${sym}${item.unitPrice.toFixed(2)}`, 360, y, { width: 80, align: 'right' });
      doc.text(`${sym}${item.subtotal.toFixed(2)}`, 440, y, { width: 90, align: 'right' });
      doc.moveDown(0.5);
    }

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // ── Totals ───────────────────────────────────────────────────
    const rightX = 440;
    doc.font('Helvetica').text('Subtotal:', 50, doc.y, { width: 390, align: 'right' });
    doc.text(`${sym}${order.subtotal.toFixed(2)}`, rightX, doc.y - doc.currentLineHeight(), {
      width: 90,
      align: 'right',
    });
    doc.moveDown(0.5);

    if (order.discountAmount > 0) {
      doc.text('Discount:', 50, doc.y, { width: 390, align: 'right' });
      doc.text(`-${sym}${order.discountAmount.toFixed(2)}`, rightX, doc.y - doc.currentLineHeight(), {
        width: 90,
        align: 'right',
      });
      doc.moveDown(0.5);
    }

    doc.font('Helvetica-Bold').text('TOTAL:', 50, doc.y, { width: 390, align: 'right' });
    doc.text(`${sym}${order.total.toFixed(2)}`, rightX, doc.y - doc.currentLineHeight(), {
      width: 90,
      align: 'right',
    });
    doc.moveDown(2);

    // ── Footer ───────────────────────────────────────────────────
    if (branding.footerText) {
      doc.fontSize(9).font('Helvetica').text(branding.footerText, { align: 'center' });
    }
    if (branding.terms) {
      doc.fontSize(8).fillColor('#888').text(branding.terms, { align: 'center' });
    }

    doc.end();
  });
}

export async function getTemplate() {
  return invoiceRepo.getTemplate();
}

export async function updateTemplate(dto: UpdateInvoiceTemplateRequest) {
  return invoiceRepo.upsertTemplate(dto);
}
