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
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import type { Condition } from '@/types';
import { motion } from 'framer-motion';

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
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="page-wrapper max-w-2xl font-sans"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={15} /> Back
        </Link>

        <h1 className="text-4xl font-bold font-serif text-white mb-6">Create Listing</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image upload */}
          <div className="glass p-6">
            <p className="label mb-3">Photos <span className="text-text-muted normal-case font-normal">({images.length}/5)</span></p>
            <div className="grid grid-cols-5 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-bg-elevated border border-bg-border">
                  <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-white/10 bg-bg-elevated hover:border-accent/40 hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-text-secondary"
                >
                  <ImagePlus size={20} />
                  <span className="text-[10px] font-semibold">Add Photo</span>
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
            <select {...register('condition')} className="input py-2">
              {CONDITIONS.map(({ value, label }) => (
                <option key={value} value={value} style={{ background: '#0a0a0a' }}>
                  {label}
                </option>
              ))}
            </select>
            {errors.condition && <p className="text-xs text-red-400 mt-1">{errors.condition.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select {...register('categoryId')} className="input py-2">
              <option value="" style={{ background: '#0a0a0a' }}>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} style={{ background: '#0a0a0a' }}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-400 mt-1">{errors.categoryId.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <Link href="/" className="btn-ghost flex-1 text-center py-3 rounded-full">Cancel</Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
              <button type="submit" className="btn-primary w-full flex justify-between h-12" disabled={isPending} id="create-listing-submit">
                <span>{isPending ? 'Creating…' : 'Create Listing'}</span>
                <span className="btn-primary-circle h-9 w-9">
                  {isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                </span>
              </button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </ProtectedRoute>
  );
}
