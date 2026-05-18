'use client';

import { Badge } from '@/components/common/Badge';
import type { StockStatus } from '@/types';

export function StockBadge({ stockStatus }: { stockStatus: StockStatus }) {
  return <Badge variant={stockStatus} />;
}
