'use client';

import Link from 'next/link';
import { useCoupons } from '@/hooks/useCoupons';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import type { ICoupon } from '@/types';

export default function CouponsPage() {
  const { coupons, isLoading, error, deactivate } = useCoupons();

  const columns = [
    { header: 'Code', accessor: 'code' as keyof ICoupon },
    {
      header: 'Type',
      accessor: (c: ICoupon) => <Badge variant={c.discountType} />,
    },
    {
      header: 'Value',
      accessor: (c: ICoupon) =>
        c.discountType === 'PERCENTAGE'
          ? `${c.discountValue}%`
          : `$${c.discountValue.toFixed(2)}`,
    },
    {
      header: 'Uses',
      accessor: (c: ICoupon) => `${c.usesRemaining} / ${c.maxUses}`,
    },
    {
      header: 'Expires',
      accessor: (c: ICoupon) => new Date(c.expiryDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: (c: ICoupon) => <Badge variant={c.status} />,
    },
    {
      header: 'Actions',
      accessor: (c: ICoupon) =>
        c.status === 'ACTIVE' ? (
          <Button size="sm" variant="danger" onClick={() => deactivate(c._id)}>
            Deactivate
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Coupons</h1>
        <Link href="/coupons/new">
          <Button size="sm">Create Coupon</Button>
        </Link>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table columns={columns} rows={coupons} emptyMessage="No coupons yet" />
      )}
    </div>
  );
}
