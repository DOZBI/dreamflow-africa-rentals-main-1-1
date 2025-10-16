import { Variants, Transition } from 'framer-motion';

/**
 * Configuration de transition optimisée GPU
 * Utilise transform et opacity uniquement pour hardware acceleration
 */
export const gpuTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // cubic-bezier easing
};

/**
 * Variants d'animation optimisées GPU
 * Utilise uniquement transform et opacity pour éviter les repaints
 */

// Fade in/out simple
export const fadeVariants: Variants = {
  hidden: { 
    opacity: 0,
    transition: gpuTransition,
  },
  visible: { 
    opacity: 1,
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0,
    transition: smoothTransition,
  },
};

// Slide depuis le bas (feed style)
export const slideUpVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 50,
    transition: gpuTransition,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0,
    y: -50,
    transition: smoothTransition,
  },
};

// Slide depuis la droite (modal/drawer)
export const slideRightVariants: Variants = {
  hidden: { 
    opacity: 0,
    x: 100,
    transition: gpuTransition,
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0,
    x: 100,
    transition: smoothTransition,
  },
};

// Scale + Fade (cards, items)
export const scaleVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.9,
    transition: gpuTransition,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    transition: smoothTransition,
  },
};

// Rotation + Scale (like button, reactions)
export const rotateScaleVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0,
    rotate: -180,
    transition: gpuTransition,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0,
    scale: 0,
    rotate: 180,
    transition: smoothTransition,
  },
};

// Stagger pour listes
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: gpuTransition,
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: smoothTransition,
  },
};

// Carousel slide (gauche/droite)
export const carouselVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: gpuTransition,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: smoothTransition,
  }),
};

/**
 * Props de style pour forcer l'accélération GPU
 * À utiliser avec les composants motion
 */
export const gpuStyles = {
  transform: 'translate3d(0, 0, 0)',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
};

/**
 * Configuration pour les gestures optimisées
 */
export const dragConstraints = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

export const tapAnimation = {
  scale: 0.95,
  transition: {
    duration: 0.1,
    ease: 'easeOut',
  },
};

export const hoverAnimation = {
  scale: 1.05,
  transition: gpuTransition,
};