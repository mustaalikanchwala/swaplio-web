'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRegister } from '@/hooks/useAuth';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { mutateAsync, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync(data);
    } catch {
      toast.error('Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Create account</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Join the student marketplace
          </p>
        </div>

        <div className="glass p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                placeholder="Rahul Sharma"
                {...register('fullName')}
                className="input"
                id="fullName"
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="you@college.edu"
                {...register('email')}
                className="input"
                id="email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  {...register('password')}
                  className="input pr-10"
                  id="password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={isPending}
              id="register-submit"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
