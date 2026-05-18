'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { uploadImage } from '@/services/inventory.service';
import { gateway } from '@/lib/gateway';
import type { IInventoryItem, ICategory } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  categoryId: z.string().min(1, 'Category required'),
  unit: z.string().min(1, 'Unit required'),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).nullish(),
  discountValue: z.coerce.number().min(0).optional(),
  currentQuantity: z.coerce.number().min(0, 'Quantity must be ≥ 0'),
  dailyReset: z.boolean(),
  imageUrl: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ItemFormProps {
  defaultValues?: Partial<IInventoryItem>;
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

// Mongoose .populate('categoryId') returns an object at runtime — extract _id if so
function normalizeCategoryId(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'object' && raw !== null && '_id' in raw) {
    return String((raw as { _id: unknown })._id);
  }
  return String(raw);
}

export function ItemForm({ defaultValues, onSubmit, isSubmitting, error }: ItemFormProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [imagePreview, setImagePreview] = useState<string>(defaultValues?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultCategoryId = normalizeCategoryId(defaultValues?.categoryId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name ?? '',
      categoryId: defaultCategoryId,
      unit: defaultValues?.unit ?? '',
      price: defaultValues?.price ?? 0,
      discountType: defaultValues?.discountType ?? null,
      discountValue: defaultValues?.discountValue ?? 0,
      currentQuantity: defaultValues?.currentQuantity ?? 0,
      dailyReset: defaultValues?.dailyReset ?? false,
      imageUrl: defaultValues?.imageUrl ?? '',
      status: defaultValues?.status ?? 'ACTIVE',
    },
  });

  const imageUrl = watch('imageUrl');
  const discountType = watch('discountType');

  useEffect(() => {
    gateway.get<ICategory[]>('/admin/categories')
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const { imageUrl: url } = await uploadImage(file);
      setValue('imageUrl', url);
      setImagePreview(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImagePreview(e.target.value);
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
  const errClass = 'text-xs text-red-500 mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label className={labelClass}>Item Name</label>
        <input
          {...register('name')}
          className={inputClass}
          placeholder="e.g. Cheese Burger"
        />
        {errors.name && <p className={errClass}>{errors.name.message}</p>}
      </div>

      {/* Category — full CRUD manager */}
      <div>
        <label className={labelClass}>Category</label>
        <CategoryManager
          categories={categories}
          selectedId={watch('categoryId')}
          onSelect={(id) => setValue('categoryId', id, { shouldValidate: true })}
          onCreated={(cat) => {
            setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
            setValue('categoryId', cat._id, { shouldValidate: true });
          }}
          onUpdated={(cat) => {
            setCategories((prev) => prev.map((c) => (c._id === cat._id ? cat : c)).sort((a, b) => a.name.localeCompare(b.name)));
          }}
          onDeleted={(id) => {
            setCategories((prev) => prev.filter((c) => c._id !== id));
            if (watch('categoryId') === id) setValue('categoryId', '', { shouldValidate: true });
          }}
        />
        {errors.categoryId && <p className={errClass}>{errors.categoryId.message}</p>}
      </div>

      {/* Unit + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Unit</label>
          <input
            {...register('unit')}
            className={inputClass}
            placeholder="pcs / kg / litre"
          />
          {errors.unit && <p className={errClass}>{errors.unit.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Price (₹)</label>
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
      </div>

      {/* Discount */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Discount (optional)</p>
        <div className="flex flex-wrap gap-3">
          {([null, 'PERCENTAGE', 'FIXED_AMOUNT'] as const).map((t) => (
            <label key={String(t)} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                className="accent-indigo-600"
                checked={discountType === t}
                onChange={() => setValue('discountType', t, { shouldValidate: true })}
              />
              {t === null ? 'No discount' : t === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed amount (₹)'}
            </label>
          ))}
        </div>
        {discountType && (
          <div>
            <label className={labelClass}>
              {discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount amount (₹)'}
            </label>
            <input
              {...register('discountValue')}
              type="number"
              min="0"
              max={discountType === 'PERCENTAGE' ? '100' : undefined}
              step="0.01"
              className={inputClass}
              placeholder={discountType === 'PERCENTAGE' ? '10' : '20.00'}
            />
            {errors.discountValue && <p className={errClass}>{errors.discountValue.message}</p>}
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className={labelClass}>Current Quantity</label>
        <input
          {...register('currentQuantity')}
          type="number"
          min="0"
          className={inputClass}
          placeholder="0"
        />
        {errors.currentQuantity && <p className={errClass}>{errors.currentQuantity.message}</p>}
      </div>

      {/* Daily Reset */}
      <div className="flex items-center gap-3">
        <input
          {...register('dailyReset')}
          type="checkbox"
          id="dailyReset"
          className="w-4 h-4 accent-indigo-600"
        />
        <label htmlFor="dailyReset" className="text-sm font-medium text-slate-700">
          Resets Daily — quantity zeroed at start of each day
        </label>
      </div>

      {/* Image */}
      <div>
        <label className={labelClass}>Item Image</label>
        <div className="flex gap-2 items-center">
          <input
            {...register('imageUrl')}
            onChange={(e) => {
              register('imageUrl').onChange(e);
              handleUrlChange(e);
            }}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://… or leave empty to upload"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        {uploadError && <p className={errClass}>{uploadError}</p>}
        {(imagePreview || imageUrl) && (
          <img
            src={imagePreview || imageUrl}
            alt="Preview"
            className="mt-2 h-24 w-24 rounded-xl object-cover border border-slate-200"
          />
        )}
      </div>

      {/* Status (edit only) */}
      {defaultValues?._id && (
        <div>
          <label className={labelClass}>Status</label>
          <select
            {...register('status')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Saving…' : defaultValues?._id ? 'Save Changes' : 'Add Item'}
      </button>
    </form>
  );
}
