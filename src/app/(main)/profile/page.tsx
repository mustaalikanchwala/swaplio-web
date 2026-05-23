'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, User } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useProfile, useUpdateProfile } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

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
      <div className="page-wrapper max-w-lg">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-violet-500/30 mb-3">
            {profile?.fullName?.charAt(0) ?? <User size={32} />}
          </div>
          <h1 className="text-xl font-bold gradient-text">{profile?.fullName}</h1>
          <p className="text-sm text-[var(--text-muted)]">{profile?.email}</p>
        </div>

        <div className="glass p-6">
          <h2 className="font-semibold text-[var(--text-primary)] mb-5">Edit Profile</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={28} className="animate-spin text-violet-400" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" {...register('fullName')} className="input" id="profile-name" />
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="label">Phone <span className="text-[var(--text-muted)] normal-case font-normal">(optional)</span></label>
                <input type="tel" {...register('phone')} className="input" id="profile-phone" placeholder="+91 98765 43210" />
              </div>

              <div>
                <label className="label">
                  Bio <span className="text-[var(--text-muted)] normal-case font-normal">({bio.length}/300)</span>
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

              <button type="submit" className="btn-primary w-full" disabled={isPending} id="save-profile">
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-4">
          <Link href="/my-listings" className="btn-ghost w-full text-center">
            View my listings
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}

