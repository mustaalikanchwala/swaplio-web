import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, ShoppingBag } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'), // was: name
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phoneNumber: z.string().optional(),                                 // was: phone
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

const RegisterPage: React.FC = () => {
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/', { replace: true }); }, [isAuthenticated, navigate]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const { confirmPassword: _, ...payload } = data;
    try {
      const res = await authApi.register(payload);
      login(res.user, res.token);
      toast.success(`Welcome to Swaplio, ${res.user.fullName}! 🚀`);
      navigate('/');
    } catch { /* handled */ }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary border border-white/10 mb-5 shadow-glow animate-pulse-soft">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">Join Swaplio</h1>
          <p className="text-muted text-sm">Buy, sell & swap with your campus community</p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit(onSubmit)} id="register-form" className="space-y-4">
            <InputField id="register-name" label="Full Name" placeholder="Your name" leftIcon={<User size={16} />} error={errors.fullName?.message} autoComplete="name" {...register('fullName')} />
            <InputField id="register-email" label="Email" type="email" placeholder="you@college.edu" leftIcon={<Mail size={16} />} error={errors.email?.message} autoComplete="email" {...register('email')} />
            <InputField id="register-phone" label="Phone (optional)" type="tel" placeholder="+91 98765 43210" leftIcon={<Phone size={16} />} {...register('phoneNumber')} />
            <InputField id="register-password" label="Password" type="password" placeholder="Min. 6 characters" leftIcon={<Lock size={16} />} error={errors.password?.message} autoComplete="new-password" {...register('password')} />
            <InputField id="register-confirm-password" label="Confirm Password" type="password" placeholder="Same as above" leftIcon={<Lock size={16} />} error={errors.confirmPassword?.message} autoComplete="new-password" {...register('confirmPassword')} />

            <Button id="register-submit-btn" type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} className="mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" id="register-to-login-link" className="text-primary hover:text-highlight font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;