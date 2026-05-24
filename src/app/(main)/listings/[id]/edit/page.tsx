'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, Loader2, ImagePlus } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useListing, useEditListing } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';
import type { Condition, ListingImage } from '@/types';
import { motion } from 'framer-motion';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  categoryId: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'NEW', label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: listing, isLoading } = useListing(id);
  const { mutateAsync, isPending } = useEditListing(id);
  const { data: categories = [] } = useCategories();

  const [keptImages, setKeptImages] = useState<ListingImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        condition: listing.condition,
        categoryId: listing.categoryId,
      });
      setKeptImages(listing.images);
    }
  }, [listing, reset]);

  const removeKeptImage = (imageId: string) => {
    setKeptImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const addNewFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - keptImages.length - newFiles.length;
    const toAdd = Array.from(files).slice(0, remaining);
    setNewFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      setNewPreviews((prev) => [...prev, URL.createObjectURL(f)]);
    });
  };

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await mutateAsync({
        data: {
          ...data,
          keepImageIds: keptImages.map((img) => img.id),
        },
        newImages: newFiles,
      });
      toast.success('Listing updated!');
      router.push(`/listings/${updated.id}`);
    } catch {
      toast.error('Failed to update listing.');
    }
  };

  if (isLoading) {
    return (
      <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  const totalImages = keptImages.length + newFiles.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="page-wrapper max-w-2xl font-sans"
    >
      <Link href={`/listings/${id}`} className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white mb-6 transition-colors font-medium">
        <ArrowLeft size={15} /> Back to listing
      </Link>

      <h1 className="text-4xl font-bold font-serif text-white mb-6">Edit Listing</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image manager */}
        <div className="glass p-6">
          <p className="label mb-3">Photos <span className="text-text-muted normal-case font-normal">({totalImages}/5)</span></p>
          <div className="grid grid-cols-5 gap-3">
            {/* Existing images */}
            {keptImages.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-bg-elevated border border-bg-border">
                <Image src={img.signedUrl} alt="Existing" fill className="object-cover" />
                <button type="button" onClick={() => removeKeptImage(img.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors">
                  <X size={10} />
                </button>
              </div>
            ))}
            {/* New image previews */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-bg-elevated border border-bg-border">
                <Image src={src} alt={`New ${i + 1}`} fill className="object-cover" />
                <button type="button" onClick={() => removeNewFile(i)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors">
                  <X size={10} />
                </button>
              </div>
            ))}
            {/* Add more */}
            {totalImages < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-white/10 bg-bg-elevated hover:border-accent/40 hover:bg-accent/5 transition-all flex flex-col items-center justify-center gap-1.5 text-text-muted hover:text-text-secondary">
                <ImagePlus size={20} />
                <span className="text-[10px] font-semibold">Add Photo</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => addNewFiles(e.target.files)} />
        </div>

        <div>
          <label className="label">Title</label>
          <input type="text" {...register('title')} className="input" />
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea rows={4} {...register('description')} className="input resize-none" />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Price (₹)</label>
          <input type="number" min={0} step="0.01" {...register('price')} className="input" />
          {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="label">Condition</label>
          <select {...register('condition')} className="input py-2">
            {CONDITIONS.map(({ value, label }) => (
              <option key={value} value={value} style={{ background: '#0a0a0a' }}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Category</label>
          <select {...register('categoryId')} className="input py-2">
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} style={{ background: '#0a0a0a' }}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <Link href={`/listings/${id}`} className="btn-ghost flex-1 text-center py-3 rounded-full">Cancel</Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
            <button type="submit" className="btn-primary w-full flex justify-between h-12" disabled={isPending} id="edit-listing-submit">
              <span>{isPending ? 'Saving…' : 'Save Changes'}</span>
              <span className="btn-primary-circle h-9 w-9">
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              </span>
            </button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
