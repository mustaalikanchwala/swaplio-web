import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building, Save } from 'lucide-react';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/store/authStore';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { getInitials } from '@/utils';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
  institution: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const ProfilePage: React.FC = () => {
  const { user: storeUser, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    usersApi.getMe().then((user) => {
      updateUser(user);
      reset({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber ?? '',
        institution: user.institution ?? '',
      });
    }).catch(() => {
      if (storeUser) reset({
        fullName: storeUser.fullName,
        phoneNumber: storeUser.phoneNumber ?? '',
        institution: storeUser.institution ?? '',
      });
    }).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await usersApi.updateProfile(data);
      updateUser(updated);
      toast.success('Profile updated!', { className: 'toast-custom' });
      reset({
        fullName: updated.fullName,
        phoneNumber: updated.phoneNumber ?? '',
        institution: updated.institution ?? '',
      });
    } catch { /* handled */ }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><ProfileSkeleton /></div>;

  const user = storeUser;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gradient">My Profile</h1>
          <p className="text-muted mt-1">Manage your account information</p>
        </div>

        {/* Avatar card */}
        <div className="glass-card rounded-3xl p-6 flex items-center gap-5 border border-white/10">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-2xl font-bold text-white shadow-glow flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              getInitials(user?.fullName ?? 'U')
            )}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-ink">{user?.fullName}</h2>
            <p className="text-muted text-sm">{user?.email}</p>
            {user?.institution && <p className="text-xs text-muted/70 mt-1">{user.institution}</p>}
          </div>
        </div>

        {/* Edit form */}
        <div className="glass-card rounded-3xl p-6 border border-white/10">
          <h2 className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-6">Edit Profile</h2>
          <form onSubmit={handleSubmit(onSubmit)} id="profile-form" className="space-y-5">
            <InputField id="profile-name" label="Full Name" placeholder="userExample" leftIcon={<User size={16} />} error={errors.fullName?.message} {...register('fullName')} />

            {/* Read-only email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-white/80">Email</label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl border border-white/10 text-muted text-sm">
                <Mail size={15} className="flex-shrink-0" />
                {user?.email}
                <span className="ml-auto text-xs text-white/40">Cannot be changed</span>
              </div>
            </div>

            <InputField id="profile-phone" label="Phone" type="tel" placeholder="+91 98765 43210" leftIcon={<Phone size={16} />} {...register('phoneNumber')} />
            <InputField id="profile-college" label="College / University" placeholder="e.g. IIT Bombay" leftIcon={<Building size={16} />} {...register('institution')} />

            <Button id="profile-save-btn" type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} disabled={!isDirty} leftIcon={<Save size={16} />}>
              Save Changes
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;