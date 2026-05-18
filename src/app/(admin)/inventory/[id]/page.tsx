'use client';

import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useInventoryItem } from '@/hooks/useInventoryItem';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import type { CreateInventoryItemRequest } from '@/types';

export default function InventoryItemFormPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id === 'new' ? undefined : (params?.id as string | undefined);
  const { save, isSaving, error } = useInventoryItem(id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInventoryItemRequest>();

  async function onSubmit(data: CreateInventoryItemRequest) {
    const ok = await save({
      ...data,
      currentQuantity: Number(data.currentQuantity),
      minimumThreshold: Number(data.minimumThreshold),
      criticalThreshold: Number(data.criticalThreshold),
      parLevel: Number(data.parLevel),
    });
    if (ok) router.push('/inventory');
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          {id ? 'Edit Inventory Item' : 'Add Inventory Item'}
        </h1>
      </div>

      {error && <Alert variant="error" message={error} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-xl border border-slate-200 p-6">
        {[
          { name: 'name', label: 'Name', required: true },
          { name: 'categoryId', label: 'Category ID', required: true },
          { name: 'unit', label: 'Unit (e.g. pieces, kg)', required: true },
        ].map(({ name, label, required }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
              type="text"
              {...register(name as keyof CreateInventoryItemRequest, {
                required: required ? `${label} is required` : false,
              })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors[name as keyof CreateInventoryItemRequest] && (
              <p className="mt-1 text-xs text-red-600">
                {errors[name as keyof CreateInventoryItemRequest]?.message}
              </p>
            )}
          </div>
        ))}

        {[
          { name: 'currentQuantity', label: 'Current Quantity' },
          { name: 'minimumThreshold', label: 'Minimum Threshold (LOW alert)' },
          { name: 'criticalThreshold', label: 'Critical Threshold (CRITICAL alert)' },
          { name: 'parLevel', label: 'Par Level (daily reset target)' },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <input
              type="number"
              min="0"
              {...register(name as keyof CreateInventoryItemRequest, {
                required: `${label} is required`,
                min: { value: 0, message: 'Must be ≥ 0' },
              })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSaving}>
            {id ? 'Save Changes' : 'Create Item'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/inventory')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
