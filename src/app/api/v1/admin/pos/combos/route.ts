import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getActive } from '@/server/services/combo.server.service';
import type { POSComboItem } from '@/types';

export const GET = withAuth(async (): Promise<NextResponse> => {
  try {
    await connectDB();
    const docs = await getActive();
    const combos: POSComboItem[] = docs.map((doc) => {
      const raw = doc.toObject({ virtuals: false });
      return {
        _id: String(raw._id),
        name: raw.name ?? '',
        price: raw.price ?? 0,
        imageUrl: raw.imageUrl,
        description: raw.description,
        isCombo: true as const,
        components: (raw.components ?? []).map((c: { inventoryItemId: unknown; itemName: string; quantity: number }) => ({
          inventoryItemId: String(c.inventoryItemId),
          itemName: c.itemName,
          quantity: c.quantity,
        })),
      };
    });
    return successResponse(combos);
  } catch (err) {
    return errorResponse(err);
  }
});
