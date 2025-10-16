import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Share, MessageSquare, Eye } from "lucide-react";
import { useState } from "react";

interface PropertyActionsProps {
  isLiked: boolean;
  isSaved: boolean;
  likesCount: number;
  viewsCount: number;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onShare: () => void;
}

const PropertyActions = ({
  isLiked,
  isSaved,
  likesCount,
  viewsCount,
  onToggleLike,
  onToggleSave,
  onShare,
}: PropertyActionsProps) => {
  const [showStats, setShowStats] = useState(false);

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="fixed right-4 bottom-32 z-20 flex flex-col space-y-4">
      {/* Like button */}
      <div className="flex flex-col items-center space-y-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 transition-all duration-200 ${
            isLiked 
              ? "bg-red-500/80 text-white scale-110" 
              : "hover:bg-white/20 text-white hover:scale-105"
          }`}
          onClick={onToggleLike}
        >
          <Heart 
            className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} 
          />
        </Button>
        <span className="text-white text-xs font-medium">
          {formatCount(likesCount)}
        </span>
      </div>

      {/* Save button */}
      <div className="flex flex-col items-center space-y-1">
        <Button
          variant="ghost"
          size="icon"
          className={`h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 transition-all duration-200 ${
            isSaved 
              ? "bg-yellow-500/80 text-white scale-110" 
              : "hover:bg-white/20 text-white hover:scale-105"
          }`}
          onClick={onToggleSave}
        >
          <Bookmark 
            className={`h-6 w-6 ${isSaved ? "fill-current" : ""}`} 
          />
        </Button>
        <span className="text-white text-xs font-medium">
          Sauver
        </span>
      </div>

      {/* Share button */}
      <div className="flex flex-col items-center space-y-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white hover:scale-105 transition-all duration-200"
          onClick={onShare}
        >
          <Share className="h-6 w-6" />
        </Button>
        <span className="text-white text-xs font-medium">
          Partager
        </span>
      </div>

      {/* Views counter */}
      <div 
        className="flex flex-col items-center space-y-1 cursor-pointer"
        onClick={() => setShowStats(!showStats)}
      >
        <div className="h-12 w-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Eye className="h-6 w-6 text-white" />
        </div>
        <span className="text-white text-xs font-medium">
          {formatCount(viewsCount)}
        </span>
      </div>
    </div>
  );
};

export default PropertyActions;
