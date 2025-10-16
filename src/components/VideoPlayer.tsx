import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeVariants, scaleVariants, gpuStyles } from "@/lib/animations";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onVideoEnd?: () => void;
  isActive?: boolean;
  autoPlay?: boolean;
}

const VideoPlayer = ({ 
  src, 
  poster, 
  className = "", 
  onVideoEnd,
  isActive = true,
  autoPlay = false
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Gestion du play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(err => {
        console.warn('⚠️ [VideoPlayer] Play prevented:', err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <p className="text-lg mb-2">Erreur de chargement</p>
          <p className="text-sm opacity-70">Impossible de lire cette vidéo</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-black overflow-hidden ${className}`}
      style={gpuStyles}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(true)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        loop={true}
        muted={isMuted}
        playsInline={true}
        preload="metadata"
        onEnded={onVideoEnd}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />

      {/* Play/Pause overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={gpuStyles}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              variants={scaleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={gpuStyles}
              className="pointer-events-auto"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white border-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mute/Unmute button */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={gpuStyles}
            className="absolute top-4 right-4 pointer-events-auto"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white border-white/20"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;