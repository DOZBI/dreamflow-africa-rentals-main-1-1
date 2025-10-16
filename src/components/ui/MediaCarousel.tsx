import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import { OptimizedImage } from './OptimizedImage';
import { AnimatedButton } from './AnimatedButton';
import { carouselVariants, gpuStyles } from '@/lib/animations';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  price?: number;
  className?: string;
  onVideoMount?: (index: number, video: HTMLVideoElement | null) => void;
}

export const MediaCarousel = ({ media: items, className = '' }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Log de débogage au montage
  useEffect(() => {
    console.log('🎠 [MediaCarousel] Component mounted with items:', {
      count: items?.length || 0,
      items: items,
      firstItem: items?.[0]
    });
  }, []);

  // Log quand les items changent
  useEffect(() => {
    console.log('🎠 [MediaCarousel] Items updated:', {
      count: items?.length || 0,
      items: items
    });
  }, [items]);

  // Vérification de sécurité
  if (!items || items.length === 0) {
    console.warn('⚠️ [MediaCarousel] No media items provided');
    return (
      <div className={`relative w-full aspect-[4/5] bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <ImageOff className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Aucun média disponible</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  // Protection contre les indices invalides
  if (!currentItem) {
    console.error('❌ [MediaCarousel] Invalid current item at index:', currentIndex);
    return (
      <div className={`relative w-full aspect-[4/5] bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <ImageOff className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Erreur de chargement</p>
        </div>
      </div>
    );
  }

  console.log('🎠 [MediaCarousel] Rendering current item:', {
    index: currentIndex,
    type: currentItem.type,
    url: currentItem.url,
    hasUrl: !!currentItem.url
  });

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className={`relative w-full aspect-[4/5] bg-black overflow-hidden ${className}`} style={gpuStyles}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={carouselVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={gpuStyles}
          className="absolute inset-0"
        >
          {currentItem.type === 'video' ? (
            <VideoPlayer
              src={currentItem.url}
              poster={currentItem.thumbnail}
              className="w-full h-full"
              isActive={true}
              autoPlay={false}
            />
          ) : (
            <OptimizedImage
              src={currentItem.url}
              alt={`Media ${currentIndex + 1}`}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <>
          <AnimatedButton
            variant="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
            aria-label="Previous media"
          >
            <ChevronLeft className="w-6 h-6" />
          </AnimatedButton>

          <AnimatedButton
            variant="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full"
            aria-label="Next media"
          >
            <ChevronRight className="w-6 h-6" />
          </AnimatedButton>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                whileTap={{ scale: 0.9 }}
                style={gpuStyles}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MediaCarousel;