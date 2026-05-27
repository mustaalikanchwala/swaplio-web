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
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useCreateListing } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import type { Condition } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAi } from '@/hooks/useAi';

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


// ── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmReplaceDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.15 }}
        className="bg-bg-surface border border-bg-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
      >
        <p className="text-sm text-white font-semibold mb-1">Replace description?</p>
        <p className="text-xs text-white/50 mb-5">Replace your existing description with AI-generated one?</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-ghost flex-1 text-sm py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-accent text-white text-sm font-semibold rounded-full py-2 hover:bg-accent/80 transition-colors"
          >
            Yes, replace
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CreateListingPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateListing();
  const { data: categories = [] } = useCategories();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    getSuggestedPrice,
    getGeneratedDescription,
    priceLoading,
    descLoading,
    priceSuggestion,
  } = useAi();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAiDescription, setPendingAiDescription] = useState<string | null>(null);
  const [dismissedPrice, setDismissedPrice] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { condition: 'GOOD' },
  });

  const watchedTitle = watch('title') ?? '';
  const watchedDescription = watch('description') ?? '';
  const watchedCondition = watch('condition') ?? '';
  const watchedCategoryId = watch('categoryId') ?? '';


  // Reset dismissed price card when a new suggestion arrives
  useEffect(() => {
    if (priceSuggestion) setDismissedPrice(false);
  }, [priceSuggestion]);

  const canTriggerAi =
    watchedTitle.length > 3 && !!watchedCondition && !!watchedCategoryId;

  const getCategoryName = () => {
    const cat = categories.find((c) => c.id === watchedCategoryId);
    return cat?.name ?? watchedCategoryId;
  };

  const handleSuggestPrice = async () => {
    if (!canTriggerAi) {
      toast('Please fill in title, condition and category first', { icon: '⚠️' });
      return;
    }
    try {
      await getSuggestedPrice(watchedTitle, watchedCondition, getCategoryName());
    } catch {
      toast('AI suggestion unavailable — please try again', {
        style: { borderLeft: '4px solid #eab308' },
      });
    }
  };

  const applyAiDescription = (desc: string) => {
    setValue('description', desc, { shouldValidate: true });
    toast.success("Description generated! Feel free to edit it.");
  };

  const handleGenerateDescription = async () => {
    if (!canTriggerAi) {
      toast('Please fill in title, condition and category first', { icon: '⚠️' });
      return;
    }
    try {
      const result = await getGeneratedDescription(watchedTitle, watchedCondition, getCategoryName());
      if (!result) return;
      if (watchedDescription && watchedDescription.trim().length > 0) {
        // Has existing content — confirm before replacing
        setPendingAiDescription(result);
        setShowConfirmDialog(true);
      } else {
        applyAiDescription(result);
      }
    } catch {
      toast('AI suggestion unavailable — please try again', {
        style: { borderLeft: '4px solid #eab308' },
      });
    }
  };

  const handleConfirmReplace = () => {
    if (pendingAiDescription) applyAiDescription(pendingAiDescription);
    setPendingAiDescription(null);
    setShowConfirmDialog(false);
  };

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
      <ConfirmReplaceDialog
        open={showConfirmDialog}
        onConfirm={handleConfirmReplace}
        onCancel={() => { setShowConfirmDialog(false); setPendingAiDescription(null); }}
      />

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
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Description</label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={descLoading}
                className="inline-flex items-center gap-1.5 text-xs text-accent border rounded-full px-3 py-1.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(48,84,255,0.10)',
                  borderColor: 'rgba(48,84,255,0.30)',
                }}
                onMouseEnter={(e) => { if (!descLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(48,84,255,0.20)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(48,84,255,0.10)'; }}
              >
                {descLoading ? (
                  <><Loader2 size={12} className="animate-spin" /><span>Generating…</span></>
                ) : (
                  <><Sparkles size={12} /><span>Generate with AI</span></>
                )}
              </button>
            </div>
            <textarea rows={4} placeholder="Describe the condition, edition, any highlights..." {...register('description')} className="input resize-none" />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}

          </div>

          {/* Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Price (₹)</label>
              <button
                type="button"
                onClick={handleSuggestPrice}
                disabled={priceLoading}
                className="inline-flex items-center gap-1.5 text-xs text-accent border rounded-full px-3 py-1.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(48,84,255,0.10)',
                  borderColor: 'rgba(48,84,255,0.30)',
                }}
                onMouseEnter={(e) => { if (!priceLoading) (e.currentTarget as HTMLElement).style.background = 'rgba(48,84,255,0.20)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(48,84,255,0.10)'; }}
              >
                {priceLoading ? (
                  <><Loader2 size={12} className="animate-spin" /><span>Thinking…</span></>
                ) : (
                  <><Sparkles size={12} /><span>Suggest Price</span></>
                )}
              </button>
            </div>
            <input type="number" min={0} step="0.01" placeholder="350" {...register('price')} className="input" />
            {errors.price && <p className="text-xs text-red-400 mt-1">{errors.price.message}</p>}

            {/* Price suggestion card */}
            <AnimatePresence>
              {priceSuggestion && !dismissedPrice && !priceLoading && (
                <motion.div
                  key="price-card"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 border rounded-xl p-3 relative"
                  style={{ background: 'rgba(48,84,255,0.10)', borderColor: 'rgba(48,84,255,0.30)' }}
                >
                  <button
                    type="button"
                    onClick={() => setDismissedPrice(true)}
                    className="absolute top-2 right-2 p-0.5 text-white/30 hover:text-white/70 transition-colors"
                    aria-label="Dismiss price suggestion"
                  >
                    <X size={12} />
                  </button>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={14} className="text-accent" />
                    <span className="text-xs text-accent font-medium">AI Price Suggestion</span>
                  </div>
                  <p className="text-lg font-bold text-white font-sans">
                    ₹{priceSuggestion.minPrice} — ₹{priceSuggestion.maxPrice}
                  </p>
                  <p className="text-xs text-white/60 mt-1">{priceSuggestion.reason}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const midpoint = Math.round((priceSuggestion.minPrice + priceSuggestion.maxPrice) / 2);
                      setValue('price', midpoint, { shouldValidate: true });
                      setDismissedPrice(true);
                    }}
                    className="mt-2 bg-accent text-white rounded-full text-xs px-3 py-1 hover:bg-accent/80 transition-colors"
                  >
                    Use this price
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
