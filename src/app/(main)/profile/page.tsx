'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, User, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useProfile, useUpdateProfile } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { motion } from 'framer-motion';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { mutateAsync, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
      });
    }
  }, [profile, reset]);

  const bio = watch('bio') ?? '';

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="page-wrapper max-w-lg font-sans"
      >
        {/* Avatar Card */}
        <div className="flex flex-col items-center mb-8 glass p-6 border border-bg-border bg-bg-surface">
          <div className="w-24 h-24 rounded-full bg-accent/15 border-2 border-accent/30 flex items-center justify-center text-accent font-bold text-4xl shadow-glow-md mb-4 relative overflow-hidden">
            {profile?.fullName?.charAt(0).toUpperCase() ?? <User size={36} />}
          </div>
          <h1 className="text-2xl font-bold text-white font-serif">{profile?.fullName}</h1>
          <p className="text-sm text-text-muted mt-1 font-sans">{profile?.email}</p>
        </div>

        {/* Edit Form */}
        <div className="glass p-6">
          <h2 className="font-semibold text-white mb-5 font-sans">Edit Profile</h2>
          {isLoading ? (
            <div className="space-y-4">
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-24 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Full Name</label>
                <input type="text" {...register('fullName')} className="input" id="profile-name" />
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="label">Phone <span className="text-text-muted normal-case font-normal">(optional)</span></label>
                <input type="tel" {...register('phone')} className="input" id="profile-phone" placeholder="+91 98765 43210" />
              </div>

              <div>
                <label className="label">
                  Bio <span className="text-text-muted normal-case font-normal">({bio.length}/300)</span>
                </label>
                <textarea
                  rows={4}
                  {...register('bio')}
                  className="input resize-none"
                  id="profile-bio"
                  placeholder="Tell others a bit about yourself..."
                />
                {errors.bio && <p className="text-xs text-red-400 mt-1">{errors.bio.message}</p>}
              </div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="pt-2">
                <button type="submit" className="btn-primary w-full flex justify-between h-12" disabled={isPending} id="save-profile">
                  <span>{isPending ? 'Saving…' : 'Save Changes'}</span>
                  <span className="btn-primary-circle h-9 w-9">
                    {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  </span>
                </button>
              </motion.div>
            </form>
          )}
        </div>

        <div className="mt-4">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/my-listings" className="btn-ghost w-full text-center py-3 rounded-full">
              <span>View my listings</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
