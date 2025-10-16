import { useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  placeholderSrc,
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    freezeOnceVisible: false,
  });

  // Charger l'image immédiatement (pas d'attente pour intersection)
  useEffect(() => {
    if (!src) {
      console.warn('⚠️ [OptimizedImage] No src provided');
      return;
    }

    console.log('📸 [OptimizedImage] Loading image:', src);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      console.log('✅ [OptimizedImage] Image loaded:', src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = (error) => {
      console.error('❌ [OptimizedImage] Image load error:', src, error);
      setHasError(true);
      onError?.();
    };
  }, [src, onLoad, onError]);

  if (hasError) {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
        <p className="text-gray-500 text-sm">Image indisponible</p>
      </div>
    );
  }

  if (!src) {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center', className)}>
        <p className="text-gray-500 text-sm">Aucune image</p>
      </div>
    );
  }

  return (
    <div 
      ref={ref as any}
      className={cn('relative overflow-hidden bg-gray-100', className)}
      style={{
        transform: 'translate3d(0, 0, 0)',
        willChange: isIntersecting ? 'transform' : 'auto',
      }}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-xs">Chargement...</div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;