import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import VideoPlayer from './VideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { usePrefetch } from '@/hooks/usePrefetch';
import { slideUpVariants, staggerItemVariants, gpuStyles } from '@/lib/animations';
import { useSwipeGestures } from "@/hooks/useSwipeGestures";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { useToast } from "@/hooks/use-toast";
import PropertyOverlay from "./PropertyOverlay";
import PropertyActions from "./PropertyActions";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const VideoFeed = () => {
  const { toast } = useToast();
  const {
    properties,
    currentProperty,
    currentIndex,
    isLoading,
    hasError,
    nextVideo,
    previousVideo,
    toggleLike,
    toggleSave,
  } = useVideoFeed();

  const [showNavigationHints, setShowNavigationHints] = useState(true);

  // Précharger les 2 prochaines vidéos
  const videoUrls = properties.map(p => p.video_url);
  usePrefetch(videoUrls, currentIndex, { enabled: true, distance: 2 });

  const swipeRef = useSwipeGestures({
    onSwipeUp: nextVideo,
    onSwipeDown: previousVideo,
    threshold: 100,
  });

  // Hide navigation hints after first interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavigationHints(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleContactOwner = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "Le chat avec les propriétaires sera bientôt disponible !",
    });
  };

  const handleShare = () => {
    if (navigator.share && currentProperty) {
      navigator.share({
        title: currentProperty.title,
        text: `Découvrez ce logement: ${currentProperty.title} à ${currentProperty.location}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans votre presse-papiers",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Chargement des propriétés...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError || !currentProperty) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Oops! Une erreur s'est produite</p>
          <p className="text-sm opacity-70">Impossible de charger les propriétés</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto snap-y snap-mandatory" style={gpuStyles}>
      <AnimatePresence mode="wait">
        {properties.map((property, index) => (
          <motion.div
            key={property.id}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={gpuStyles}
            className="h-full snap-start"
          >
            <VideoPlayer
              src={property.video_url}
              poster={property.thumbnail_url}
              className="w-full h-full"
              isActive={index === currentIndex}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default VideoFeed;