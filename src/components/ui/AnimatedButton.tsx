import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { tapAnimation, hoverAnimation, gpuStyles } from '@/lib/animations';

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

/**
 * Bouton animé optimisé GPU
 * Animations de tap/hover avec hardware acceleration
 */
export const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}: AnimatedButtonProps) => {
  const variantClasses = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    icon: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileTap={!disabled && !isLoading ? tapAnimation : undefined}
      whileHover={!disabled && !isLoading ? hoverAnimation : undefined}
      style={gpuStyles}
      className={cn(
        'rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          style={gpuStyles}
        />
      ) : (
        children
      )}
    </motion.button>
  );
};

export default AnimatedButton;