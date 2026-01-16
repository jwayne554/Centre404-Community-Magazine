'use client';

import React from 'react';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: React.ReactNode;
  // Accessibility props
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-describedby'?: string;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  icon,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-describedby': ariaDescribedby,
}: ButtonProps) => {
  // WCAG 2.1 AA requires 44x44px minimum touch targets
  const baseStyles = 'rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] inline-flex items-center justify-center';

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary/90 text-white focus:ring-primary',
    secondary: 'bg-accent hover:bg-accent/90 text-charcoal focus:ring-accent',
    outline: 'bg-white border border-light-gray hover:bg-background text-charcoal focus:ring-primary',
    ghost: 'bg-transparent hover:bg-gray-100 text-dark-gray focus:ring-primary',
    icon: 'bg-transparent hover:bg-background text-charcoal focus:ring-primary min-w-[44px]'
  };

  const sizeStyles = {
    sm: variant === 'icon' ? 'p-2.5' : 'px-3 py-2 text-sm',
    md: variant === 'icon' ? 'p-2.5' : 'px-4 py-2.5',
    lg: variant === 'icon' ? 'p-3' : 'px-6 py-3 text-lg'
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-describedby={ariaDescribedby}
    >
      {icon && <span className={children ? 'mr-2 inline-flex items-center' : 'inline-flex items-center'}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
