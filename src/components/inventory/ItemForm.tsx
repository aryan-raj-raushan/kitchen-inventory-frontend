'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InlineCategoryCreate } from '@/components/categories/InlineCategoryCreate';
import { uploadImage } from '@/services/inventory.service';
import { gateway } from '@/lib/gateway';
import type { IInventoryItem, ICategory } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  categoryId: z.string().min(1, 'Category required'),
  unit: z.string().min(1, 'Unit required'),
  price: z.coerce.number().min(0, 'Price must be ≥ 0'),
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
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: defaultValues?.name ?? '',
      categoryId: defaultCategoryId,
      unit: defaultValues?.unit ?? '',
      price: defaultValues?.price ?? 0,
      currentQuantity: defaultValues?.currentQuantity ?? 0,
      dailyReset: defaultValues?.dailyReset ?? false,
      imageUrl: defaultValues?.imageUrl ?? '',
      status: defaultValues?.status ?? 'ACTIVE',
    },
  });

  const imageUrl = watch('imageUrl');

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

      {/* Category — controlled via Controller to avoid async timing issues */}
      <div>
        <label className={labelClass}>Category</label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <select {...field} className={inputClass}>
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          )}
        />
        {errors.categoryId && <p className={errClass}>{errors.categoryId.message}</p>}
        <InlineCategoryCreate
          onCreated={(cat) => {
            setCategories((prev) =>
              [...prev, cat].sort((a, b) => a.name.localeCompare(b.name))
            );
            setValue('categoryId', cat._id, { shouldValidate: true });
          }}
        />
      </div>

      {/* Unit + Price */}
      <div className="grid grid-cols-2 gap-4">
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
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
