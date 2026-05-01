import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Upload, X, ImagePlus } from 'lucide-react';
import { listingsApi } from '@/api/listings';
import { useCategoryStore } from '@/store/categoryStore';
import { InputField, TextareaField, SelectField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import type { Condition } from '@/types';

const MAX_IMAGES = 5;
const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(1, 'Price must be at least ₹1'),
  condition: z.string().min(1, 'Select a condition'),
  categoryId: z.string().min(1, 'Select a category'),
});
type FormData = z.infer<typeof schema>;

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass-card rounded-3xl p-6 border border-white/10">
    <h2 className="text-xs font-bold text-primary/50 uppercase tracking-widest mb-5">{title}</h2>
    {children}
  </div>
);

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const toAdd = files.slice(0, MAX_IMAGES - images.length);
    setImages((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => setPreviews((prev) => [...prev, URL.createObjectURL(file)]));
  }, [images.length]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const listing = await listingsApi.create(
        { ...data, price: Number(data.price), condition: data.condition as Condition },
        images
      );
      toast.success('Listing published! 🎉');
      navigate(`/listings/${listing.id}`);
    } catch { /* handled */ }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gradient">Create Listing</h1>
          <p className="text-muted mt-1 text-sm">Fill in the details to list your item</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} id="create-listing-form" className="space-y-5">
          {/* Images */}
          <SectionCard title={`Photos (${images.length}/${MAX_IMAGES})`}>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
              {previews.map((url, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-white/10 opacity-90" />
                  <button type="button" id={`remove-image-${i}`} onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X size={12} className="text-ink" />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium shadow-glow-soft">Cover</div>
                  )}
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label htmlFor="image-upload"
                  className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 cursor-pointer transition-all group">
                  <ImagePlus size={22} className="text-primary/30 group-hover:text-primary/60 mb-1 transition-colors" />
                  <span className="text-xs text-muted group-hover:text-white/60 transition-colors">Add photo</span>
                  <input id="image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
              )}
            </div>
            <p className="text-xs text-muted">First image will be the cover photo. Max {MAX_IMAGES} images.</p>
          </SectionCard>

          {/* Details */}
          <SectionCard title="Listing Details">
            <div className="space-y-5">
              <InputField id="create-title" label="Title" placeholder="What are you selling?" error={errors.title?.message} {...register('title')} />
              <TextareaField id="create-description" label="Description" placeholder="Describe the item — condition, features, reason for selling..." rows={4} error={errors.description?.message} {...register('description')} />
              <InputField id="create-price" label="Price (₹)" type="number" min={1} placeholder="e.g. 500" error={errors.price?.message} {...register('price')} />
              <div className="grid grid-cols-2 gap-4">
                <Controller name="condition" control={control} render={({ field }) => (
                  <SelectField id="create-condition" label="Condition" options={CONDITIONS} placeholder="Select condition" error={errors.condition?.message} {...field} />
                )} />
                <Controller name="categoryId" control={control} render={({ field }) => (
                  <SelectField id="create-category" label="Category" options={categories.map((c) => ({ value: c.id, label: c.name }))} placeholder="Select category" error={errors.categoryId?.message} {...field} />
                )} />
              </div>
            </div>
          </SectionCard>

          <div className="flex gap-4">
            <Button id="create-cancel-btn" type="button" variant="ghost" size="lg" fullWidth onClick={() => navigate(-1)}>Cancel</Button>
            <Button id="create-submit-btn" type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} leftIcon={<Upload size={16} />}>Publish Listing</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateListingPage;
