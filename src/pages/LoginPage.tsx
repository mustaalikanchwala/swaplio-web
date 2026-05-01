import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, ShoppingBag } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated, navigate, from]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.fullName}! 👋`);
      navigate(from, { replace: true });
    } catch { /* handled by interceptor */ }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary border border-white/10 mb-5 shadow-glow animate-pulse-soft">
            <ShoppingBag size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">Welcome back</h1>
          <p className="text-muted text-sm">Sign in to your Swaplio account</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit(onSubmit)} id="login-form" className="space-y-5">
            <InputField
              id="login-email"
              label="Email"
              type="email"
              placeholder="you@college.edu"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />
            <InputField
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />
            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" id="login-to-register-link" className="text-primary hover:text-highlight font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
