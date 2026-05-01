import React, { forwardRef } from 'react';
import { cn } from '@/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, leftIcon, rightIcon, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-white/70">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-secondary border rounded-xl px-4 py-2.5 text-ink placeholder-white/25 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
              'hover:border-primary/30',
              error
                ? 'border-danger/50 focus:ring-danger/20'
                : 'border-white/10',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted">{helperText}</p>}
      </div>
    );
  }
);
InputField.displayName = 'InputField';

// ─── Textarea ─────────────────────────────────────────────────────

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, containerClassName, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-white/70">{label}</label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-secondary border rounded-xl px-4 py-2.5 text-ink placeholder-white/25 transition-all duration-200 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
            'hover:border-primary/30',
            error ? 'border-danger/50' : 'border-white/10',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    );
  }
);
TextareaField.displayName = 'TextareaField';

// ─── Select ───────────────────────────────────────────────────────

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, containerClassName, className, id, options, placeholder, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-white/70">{label}</label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-secondary border rounded-xl px-4 py-2.5 text-ink transition-all duration-200 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
            'hover:border-primary/30',
            error ? 'border-danger/50' : 'border-white/10',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-secondary text-white/40">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-secondary text-ink">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </div>
    );
  }
);
SelectField.displayName = 'SelectField';
