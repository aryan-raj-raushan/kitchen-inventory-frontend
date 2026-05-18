import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { withAuth } from '@/lib/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { getAvailableForPOS } from '@/server/services/inventory.server.service';
import type { POSItem } from '@/types';

export const GET = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filters = {
      categoryId: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    };
    const docs = await getAvailableForPOS(filters);

    // Transform Mongoose docs → plain POSItem objects to avoid serialization issues
    const items: POSItem[] = docs.map((doc) => {
      const raw = doc.toObject({ virtuals: false });
      const catId = raw.categoryId as unknown;
      const categoryIdStr =
        catId && typeof catId === 'object' && '_id' in (catId as object)
          ? String((catId as { _id: unknown })._id)
          : String(catId ?? '');
      const categoryName =
        catId && typeof catId === 'object' && 'name' in (catId as object)
          ? String((catId as { name: unknown }).name)
          : '';

      return {
        _id: String(raw._id),
        name: raw.name ?? '',
        price: raw.price ?? 0,
        discountType: raw.discountType ?? null,
        discountValue: raw.discountValue ?? 0,
        currentQuantity: raw.currentQuantity ?? 0,
        unit: raw.unit ?? '',
        imageUrl: raw.imageUrl,
        categoryId: categoryIdStr,
        categoryName,
      };
    });

    return successResponse(items);
  } catch (err) {
    return errorResponse(err);
  }
});
