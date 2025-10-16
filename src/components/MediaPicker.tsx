
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Image, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaPickerProps {
  onMediaSelected: (file: File) => void;
  selectedMedia?: File | null;
  className?: string;
}

const MediaPicker = ({ onMediaSelected, selectedMedia, className }: MediaPickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    onMediaSelected(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveMedia = () => {
    setPreviewUrl(null);
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const getMediaType = (file: File): 'image' | 'video' => {
    return file.type.startsWith('video/') ? 'video' : 'image';
  };

  const triggerFileInput = (inputRef: React.RefObject<HTMLInputElement>) => {
    inputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview */}
      {previewUrl && selectedMedia && (
        <div className="relative rounded-lg overflow-hidden bg-gray-100">
          {getMediaType(selectedMedia) === 'video' ? (
            <video
              src={previewUrl}
              className="w-full h-48 object-cover"
              controls
              preload="metadata"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
          )}
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveMedia}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Media Selection Buttons */}
      {!previewUrl && (
        <div className="grid grid-cols-3 gap-3">
          {/* Gallery Photos */}
          <Button
            type="button"
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => triggerFileInput(fileInputRef)}
          >
            <Image className="h-6 w-6" />
            <span className="text-xs">Galerie</span>
          </Button>

          {/* Gallery Videos */}
          <Button
            type="button"
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => triggerFileInput(videoInputRef)}
          >
            <Video className="h-6 w-6" />
            <span className="text-xs">Vidéo</span>
          </Button>

          {/* Camera */}
          <Button
            type="button"
            variant="outline"
            className="h-20 flex-col space-y-2"
            onClick={() => triggerFileInput(cameraInputRef)}
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs">Appareil photo</span>
          </Button>
        </div>
      )}

      {/* Hidden file inputs */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      <Input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      <Input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
    </div>
  );
};

export default MediaPicker;
