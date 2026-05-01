import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Save, X, ImagePlus } from 'lucide-react';
import { listingsApi } from '@/api/listings';
import { useCategoryStore } from '@/store/categoryStore';
import { InputField, TextareaField, SelectField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Listing, Condition } from '@/types';

const MAX_IMAGES = 5;
const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];
const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(1),
  condition: z.string().min(1),
  categoryId: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-secondary rounded-3xl p-6 shadow-card border border-accent/12">
    <h2 className="text-xs font-bold text-accent/50 uppercase tracking-widest mb-5">{title}</h2>
    {children}
  </div>
);

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [keepImageIds, setKeepImageIds] = useState<(string | number)[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!id) return;
    listingsApi.getById(id).then((l) => {
      setListing(l);
      setKeepImageIds(l.images?.map((img) => img.id) ?? []);
      reset({ title: l.title, description: l.description, price: l.price, condition: l.condition, categoryId: String(l.category?.id ?? '') });
    }).catch(() => navigate('/my-listings')).finally(() => setLoadingListing(false));
  }, [id, navigate, reset]);

  const handleNewImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const total = keepImageIds.length + newImages.length;
    const toAdd = files.slice(0, MAX_IMAGES - total);
    setNewImages((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => setNewPreviews((prev) => [...prev, URL.createObjectURL(file)]));
  }, [keepImageIds.length, newImages.length]);

  const removeExistingImage = (imageId: string | number) =>
    setKeepImageIds((prev) => prev.filter((i) => i !== imageId));
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImages = keepImageIds.length + newImages.length;

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    try {
      await listingsApi.update(id, { ...data, price: Number(data.price), condition: data.condition as Condition, keepImageIds }, newImages);
      toast.success('Listing updated!');
      navigate(`/listings/${id}`);
    } catch { /* handled */ }
  };

  if (loadingListing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  if (!listing) return null;

  const existingImages = listing.images?.filter((img) => keepImageIds.includes(img.id)) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gradient">Edit Listing</h1>
          <p className="text-muted mt-1 text-sm">Update your listing details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} id="edit-listing-form" className="space-y-5">
          <SectionCard title={`Photos (${totalImages}/${MAX_IMAGES})`}>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
              {existingImages.map((img, i) => (
                <div key={img.id} className="relative group aspect-square">
                  <img src={img.signedUrl} alt={`Image ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-accent/20 opacity-90" />
                  <button type="button" id={`remove-existing-img-${img.id}`} onClick={() => removeExistingImage(img.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X size={12} className="text-ink" />
                  </button>
                </div>
              ))}
              {newPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative group aspect-square">
                  <img src={url} alt={`New ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-accent/40 opacity-90" />
                  <button type="button" id={`remove-new-img-${i}`} onClick={() => removeNewImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                    <X size={12} className="text-ink" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-accent text-ink text-xs px-1.5 py-0.5 rounded font-medium">New</div>
                </div>
              ))}
              {totalImages < MAX_IMAGES && (
                <label htmlFor="edit-image-upload"
                  className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-accent/20 hover:border-accent/50 hover:bg-card/50 cursor-pointer transition-all group">
                  <ImagePlus size={22} className="text-accent/30 group-hover:text-accent/60 mb-1 transition-colors" />
                  <span className="text-xs text-muted group-hover:text-white/60 transition-colors">Add</span>
                  <input id="edit-image-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleNewImageChange} />
                </label>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Listing Details">
            <div className="space-y-5">
              <InputField id="edit-title" label="Title" error={errors.title?.message} {...register('title')} />
              <TextareaField id="edit-description" label="Description" rows={4} error={errors.description?.message} {...register('description')} />
              <InputField id="edit-price" label="Price (₹)" type="number" min={1} error={errors.price?.message} {...register('price')} />
              <div className="grid grid-cols-2 gap-4">
                <Controller name="condition" control={control} render={({ field }) => (
                  <SelectField id="edit-condition" label="Condition" options={CONDITIONS} error={errors.condition?.message} {...field} />
                )} />
                <Controller name="categoryId" control={control} render={({ field }) => (
                  <SelectField id="edit-category" label="Category" options={categories.map((c) => ({ value: c.id, label: c.name }))} error={errors.categoryId?.message} {...field} />
                )} />
              </div>
            </div>
          </SectionCard>

          <div className="flex gap-4">
            <Button id="edit-cancel-btn" type="button" variant="ghost" size="lg" fullWidth onClick={() => navigate(-1)}>Cancel</Button>
            <Button id="edit-submit-btn" type="submit" variant="accent" size="lg" fullWidth loading={isSubmitting} leftIcon={<Save size={16} />}>Save Changes</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditListingPage;
