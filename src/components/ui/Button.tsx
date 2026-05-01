import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-ink border border-primary/40 hover:bg-hover hover:shadow-glow-soft shadow-btn',
  accent:
    'bg-accent text-ink hover:opacity-90 shadow-glow hover:shadow-glow-lg',
  secondary:
    'bg-card border border-white/10 text-white/80 hover:border-primary/50 hover:bg-primary/20',
  ghost:
    'bg-transparent text-muted hover:text-ink hover:bg-secondary/60',
  danger:
    'bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30',
  outline:
    'bg-transparent border border-white/20 text-white/80 hover:bg-white/5 hover:border-white/40',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3 text-sm rounded-2xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      transition={{ duration: 0.15 }}
      style={{ display: fullWidth ? 'block' : 'inline-block' }}
    >
      <button
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-40 cursor-not-allowed',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    </motion.div>
  );
};
