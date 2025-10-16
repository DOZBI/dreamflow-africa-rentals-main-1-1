import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  fadeVariants,
  slideUpVariants,
  slideRightVariants,
  scaleVariants,
  rotateScaleVariants,
  staggerContainerVariants,
  gpuStyles,
  gpuTransition,
} from '@/lib/animations';

type AnimationType = 
  | 'fade' 
  | 'slideUp' 
  | 'slideRight' 
  | 'scale' 
  | 'rotateScale' 
  | 'stagger';

interface AnimatedContainerProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}

/**
 * Composant conteneur animé optimisé GPU
 * Utilise Framer Motion avec transform et opacity uniquement
 */
export const AnimatedContainer = ({
  children,
  animation = 'fade',
  delay = 0,
  className,
  ...props
}: AnimatedContainerProps) => {
  const getVariants = () => {
    switch (animation) {
      case 'slideUp':
        return slideUpVariants;
      case 'slideRight':
        return slideRightVariants;
      case 'scale':
        return scaleVariants;
      case 'rotateScale':
        return rotateScaleVariants;
      case 'stagger':
        return staggerContainerVariants;
      case 'fade':
      default:
        return fadeVariants;
    }
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={gpuStyles}
      transition={{
        ...gpuTransition,
        delay,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;