import { useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface OptimizedVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  onVideoEnd?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  preload?: 'none' | 'metadata' | 'auto';
  prefetchNext?: boolean;
}

export const OptimizedVideo = ({
  src,
  poster,
  className,
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
  onVideoEnd,
  onPlay,
  onPause,
  preload = 'metadata',
  prefetchNext = false,
}: OptimizedVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const { ref: containerRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '50px',
  });

  // Log de débogage
  useEffect(() => {
    console.log('🎥 [OptimizedVideo] Video component mounted:', { src, poster });
  }, []);

  // Gestion du play/pause basé sur la visibilité
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    console.log('🎥 [OptimizedVideo] Visibility changed:', { isIntersecting, autoPlay, paused: video.paused });

    if (isIntersecting && autoPlay) {
      video.play().catch(err => {
        console.warn('⚠️ [OptimizedVideo] Autoplay prevented:', err);
      });
    } else if (!isIntersecting && !video.paused) {
      video.pause();
    }
  }, [isIntersecting, autoPlay, isLoaded]);

  // Préchargement des métadonnées
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      console.log('✅ [OptimizedVideo] Video metadata loaded:', src);
      setIsLoaded(true);
    };
    
    const handleError = (error: Event) => {
      console.error('❌ [OptimizedVideo] Video load error:', src, error);
      setHasError(true);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
    };
  }, [src]);

  if (hasError) {
    return (
      <div className={cn('bg-gray-900 flex items-center justify-center', className)}>
        <p className="text-white text-sm">Erreur de chargement vidéo</p>
      </div>
    );
  }

  if (!src) {
    return (
      <div className={cn('bg-gray-900 flex items-center justify-center', className)}>
        <p className="text-white text-sm">Aucune vidéo</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef as any}
      className={cn('relative overflow-hidden bg-black', className)}
      style={{
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={preload}
        onEnded={onVideoEnd}
        onPlay={onPlay}
        onPause={onPause}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OptimizedVideo;