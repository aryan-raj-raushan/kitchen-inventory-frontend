import 'server-only';
import mongoose from 'mongoose';
import { InventoryItem } from '../models/InventoryItem';
import { Coupon } from '../models/Coupon';
import { StockMovement } from '../models/StockMovement';
import { Invoice } from '../models/Invoice';
import { InvoiceTemplate } from '../models/InvoiceTemplate';
import * as orderRepo from '../repositories/order.repository';
import { generateInvoiceNumber } from '../utils/invoiceNumber';
import { ValidationError, NotFoundError, ConflictError } from '@/lib/errors';
import type { CreateOrderRequest } from '@/types';
import type { IOrderDoc } from '../models/Order';

export async function createOrder(dto: CreateOrderRequest): Promise<IOrderDoc> {
  const session = await mongoose.startSession();

  try {
    let createdOrder!: IOrderDoc;

    await session.withTransaction(async () => {
      // 1. Validate coupon if provided
      let couponDoc: (typeof Coupon extends mongoose.Model<infer T> ? T : never) | null = null;
      let discountAmount = 0;

      if (dto.couponCode) {
        couponDoc = await Coupon.findOne({ code: dto.couponCode.toUpperCase() }).session(session);
        if (!couponDoc) throw new ValidationError('Coupon not found');
        if (couponDoc.status !== 'ACTIVE') throw new ValidationError('Coupon is not active');
        if (couponDoc.maxUses > 0 && couponDoc.usesRemaining <= 0)
          throw new ValidationError('Coupon has no uses remaining');
        const now = new Date();
        if (new Date(couponDoc.startDate) > now) throw new ValidationError('Coupon is not yet valid');
        if (new Date(couponDoc.expiryDate) < now) throw new ValidationError('Coupon has expired');
      }

      // 2. Validate each ordered item and compute subtotal
      let subtotal = 0;
      const orderItems = [];

      for (const { inventoryItemId, quantity } of dto.items) {
        if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
          throw new ValidationError(`Invalid inventory item ID: ${inventoryItemId}`);
        }

        const invItem = await InventoryItem.findById(inventoryItemId).session(session);
        if (!invItem || invItem.status !== 'ACTIVE') {
          throw new NotFoundError(`Inventory item not found or inactive: ${inventoryItemId}`);
        }
        if (invItem.currentQuantity < quantity) {
          throw new ConflictError(
            `Insufficient stock for "${invItem.name}": requested ${quantity}, available ${invItem.currentQuantity}`
          );
        }

        const itemSubtotal = invItem.price * quantity;
        subtotal += itemSubtotal;
        orderItems.push({
          inventoryItemId: invItem._id,
          itemName: invItem.name,
          quantity,
          unitPrice: invItem.price,
          subtotal: itemSubtotal,
        });
      }

      // 3. Compute discount
      if (couponDoc) {
        if (couponDoc.discountType === 'PERCENTAGE') {
          discountAmount = subtotal * (couponDoc.discountValue / 100);
        } else {
          discountAmount = Math.min(couponDoc.discountValue, subtotal);
        }
      }

      const total = subtotal - discountAmount;

      // 4. Deduct inventory quantities + create StockMovements
      for (const { inventoryItemId, quantity } of dto.items) {
        await InventoryItem.findByIdAndUpdate(
          inventoryItemId,
          { $inc: { currentQuantity: -quantity } },
          { session }
        );

        const item = orderItems.find((i) => String(i.inventoryItemId) === inventoryItemId);
        await StockMovement.create(
          [
            {
              inventoryItemId,
              movementType: 'ORDER_DEDUCTION',
              quantityDelta: -quantity,
              notes: `Order deduction for ${item?.itemName ?? inventoryItemId}`,
              recordedBy: 'admin',
              recordedAt: new Date(),
            },
          ],
          { session }
        );
      }

      // 5. Decrement coupon uses
      if (couponDoc && couponDoc.maxUses > 0) {
        await Coupon.findByIdAndUpdate(
          couponDoc._id,
          { $inc: { usesRemaining: -1 } },
          { session }
        );
      }

      // 6. Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(session);

      // 7. Create order
      createdOrder = await orderRepo.create(
        {
          invoiceNumber,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          couponId: couponDoc?._id,
          items: orderItems,
          subtotal,
          discountAmount,
          total,
          status: 'CONFIRMED',
        },
        session
      );

      // 8. Capture branding snapshot and create Invoice document
      const template = await InvoiceTemplate.findOne().session(session);
      await Invoice.create(
        [
          {
            orderId: createdOrder._id,
            brandingSnapshot: {
              restaurantName: template?.restaurantName ?? 'My Restaurant',
              address: template?.address,
              logoUrl: template?.logoUrl,
              footerText: template?.footerText,
              terms: template?.terms,
              currencySymbol: template?.currencySymbol ?? '₹',
            },
            generatedAt: new Date(),
          },
        ],
        { session }
      );
    });

    return createdOrder;
  } finally {
    session.endSession();
  }
}

export async function getOrders(filters: { status?: string; page?: number; limit?: number }) {
  return orderRepo.findAll(filters);
}

export async function getOrder(id: string) {
  const order = await orderRepo.findById(id);
  if (!order) throw new NotFoundError('Order not found');
  return order;
}

export async function cancelOrder(id: string) {
  const order = await orderRepo.cancel(id);
  if (!order) throw new NotFoundError('Order not found');
  return order;
}
