'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { gateway } from '@/lib/gateway';
import { ComponentItemPicker } from './ComponentItemPicker';
import type { ICombo, IInventoryItem, ICategory, CreateComboRequest } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ComboFormProps {
  defaultValues?: Partial<ICombo>;
  onSubmit: (data: CreateComboRequest) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

interface ComponentRow {
  inventoryItemId: string;
  quantity: number;
}

export function ComboForm({ defaultValues, onSubmit, isSubmitting, error }: ComboFormProps) {
  const [inventoryItems, setInventoryItems] = useState<IInventoryItem[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [components, setComponents] = useState<ComponentRow[]>(
    defaultValues?.components?.map((c) => ({
      inventoryItemId: c.inventoryItemId,
      quantity: c.quantity,
    })) ?? [{ inventoryItemId: '', quantity: 1 }]
  );
  const [componentError, setComponentError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name ?? '',
      price: defaultValues?.price ?? 0,
      description: defaultValues?.description ?? '',
      imageUrl: defaultValues?.imageUrl ?? '',
    },
  });

  useEffect(() => {
    Promise.all([
      gateway.get<IInventoryItem[]>('/admin/inventory?status=ACTIVE').catch(() => [] as IInventoryItem[]),
      gateway.get<ICategory[]>('/admin/categories').catch(() => [] as ICategory[]),
    ]).then(([items, cats]) => {
      setInventoryItems(items);
      setCategories(cats);
    });
  }, []);

  function addComponent() {
    setComponents((prev) => [...prev, { inventoryItemId: '', quantity: 1 }]);
  }

  function removeComponent(index: number) {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  }

  function setComponentItem(index: number, id: string) {
    setComponents((prev) => prev.map((c, i) => (i === index ? { ...c, inventoryItemId: id } : c)));
  }

  function setComponentQty(index: number, qty: number) {
    setComponents((prev) => prev.map((c, i) => (i === index ? { ...c, quantity: qty } : c)));
  }

  function handleItemCreated(item: IInventoryItem) {
    setInventoryItems((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
  }

  function handleItemUpdated(item: IInventoryItem) {
    setInventoryItems((prev) =>
      prev.map((it) => (it._id === item._id ? item : it)).sort((a, b) => a.name.localeCompare(b.name))
    );
  }

  function handleItemDeleted(id: string) {
    setInventoryItems((prev) => prev.filter((it) => it._id !== id));
    setComponents((prev) =>
      prev.map((c) => (c.inventoryItemId === id ? { ...c, inventoryItemId: '' } : c))
    );
  }

  async function handleFormSubmit(values: FormValues) {
    const validComponents = components.filter((c) => c.inventoryItemId && c.quantity > 0);
    if (validComponents.length === 0) {
      setComponentError('Add at least one component item');
      return;
    }
    setComponentError('');
    await onSubmit({
      ...values,
      imageUrl: values.imageUrl || undefined,
      description: values.description || undefined,
      components: validComponents,
    });
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
  const errClass = 'text-xs text-red-500 mt-1';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Combo Name</label>
        <input {...register('name')} className={inputClass} placeholder="e.g. Veg Thali, Family Combo" />
        {errors.name && <p className={errClass}>{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Selling Price (₹)</label>
          <input
            {...register('price')}
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            placeholder="0.00"
          />
          {errors.price && <p className={errClass}>{errors.price.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Image URL <span className="text-slate-400 font-normal">(optional)</span></label>
          <input {...register('imageUrl')} className={inputClass} placeholder="https://…" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
        <input {...register('description')} className={inputClass} placeholder="e.g. Rice + Dal + Sabzi + Roti" />
      </div>

      {/* Components */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`${labelClass} mb-0`}>
            Components
            <span className="ml-1 text-slate-400 font-normal text-xs">— select, create, edit, or delete items</span>
          </label>
          <button
            type="button"
            onClick={addComponent}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            <Plus size={12} /> Add row
          </button>
        </div>

        <div className="space-y-2">
          {components.map((comp, i) => (
            <div key={i} className="flex gap-2 items-start">
              <ComponentItemPicker
                items={inventoryItems}
                categories={categories}
                selectedId={comp.inventoryItemId}
                onSelect={(id) => setComponentItem(i, id)}
                onItemCreated={handleItemCreated}
                onItemUpdated={handleItemUpdated}
                onItemDeleted={handleItemDeleted}
              />
              <input
                type="number"
                min="1"
                value={comp.quantity}
                onChange={(e) => setComponentQty(i, Number(e.target.value))}
                className="w-20 flex-shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                placeholder="Qty"
              />
              {components.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeComponent(i)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 transition-colors mt-0.5"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {componentError && <p className={errClass}>{componentError}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Saving…' : defaultValues?._id ? 'Save Changes' : 'Create Combo'}
      </button>
    </form>
  );
}
