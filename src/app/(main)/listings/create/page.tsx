'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  ImagePlus,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useCreateListing } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';
import type { Condition } from '@/types';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  categoryId: z.string().min(1, 'Please select a category'),
});

type FormData = z.infer<typeof schema>;

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'NEW', label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

export default function CreateListingPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateListing();
  const { data: categories = [] } = useCategories();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { condition: 'GOOD' },
  });

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPreviews((prev) => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (images.length === 0) {
      toast.error('Please add at least one image.');
      return;
    }
    try {
      const listing = await mutateAsync({ data, images });
      toast.success('Listing created!');
      router.push(`/listings/${listing.id}`);
    } catch {
      toast.error('Failed to create listing.');
    }
  };

  return (
    <div className="page-wrapper max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </Link>

      <h1 className="text-2xl font-bold gradient-text mb-6">Create Listing</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Image upload */}
        <div className="glass p-5">
          <p className="label mb-3">Photos <span className="text-[var(--text-muted)] normal-case font-normal">({images.length}/5)</span></p>
          <div className="grid grid-cols-4 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-secondary)]">
                <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-red-500/80 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[var(--border-subtle)] hover:border-violet-500/50 hover:bg-violet-500/5 transition-all flex flex-col items-center justify-center gap-1 text-[var(--text-muted)]"
              >
                <ImagePlus size={22} />
                <span className="text-[10px]">Add photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addImages(e.target.files)}
          />
        </div>

        {/* Title */}
        <div>
          <label className="label">Title</label>
          <input type="text" placeholder="e.g. Engineering Mathematics – 3rd Edition" {...register('title')} className="input" />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea rows={4} placeholder="Describe the condition, edition, any highlights..." {...register('description')} className="input resize-none" />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
        </div>

        {/* Price */}
        <div>
          <label className="label">Price (₹)</label>
          <input type="number" min={0} step="0.01" placeholder="350" {...register('price')} className="input" />
          {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price.message}</p>}
        </div>

        {/* Condition */}
        <div>
          <label className="label">Condition</label>
          <select {...register('condition')} className="input">
            {CONDITIONS.map(({ value, label }) => (
              <option key={value} value={value} style={{ background: '#130d1f' }}>
                {label}
              </option>
            ))}
          </select>
          {errors.condition && <p className="text-xs text-red-400 mt-1">{errors.condition.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <select {...register('categoryId')} className="input">
            <option value="" style={{ background: '#130d1f' }}>Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} style={{ background: '#130d1f' }}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-400 mt-1">{errors.categoryId.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/" className="btn-ghost flex-1 text-center">Cancel</Link>
          <button type="submit" className="btn-primary flex-1" disabled={isPending} id="create-listing-submit">
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {isPending ? 'Creating…' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
