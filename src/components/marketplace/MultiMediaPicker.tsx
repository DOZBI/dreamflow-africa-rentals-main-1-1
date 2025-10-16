
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Image, Video, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface MultiMediaPickerProps {
  onMediaChange: (files: MediaFile[]) => void;
  maxImages?: number;
  maxVideos?: number;
  className?: string;
}

const MultiMediaPicker = ({ 
  onMediaChange, 
  maxImages = 10, 
  maxVideos = 3, 
  className 
}: MultiMediaPickerProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const getImageCount = () => mediaFiles.filter(f => f.type === 'image').length;
  const getVideoCount = () => mediaFiles.filter(f => f.type === 'video').length;

  const handleFileSelect = (files: FileList | null, inputType: 'image' | 'video' | 'camera') => {
    if (!files) return;

    const newFiles: MediaFile[] = [];
    
    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) return;
      
      const type = isVideo ? 'video' : 'image';
      
      // Check limits
      const currentImageCount = getImageCount();
      const currentVideoCount = getVideoCount();
      const newImageCount = newFiles.filter(f => f.type === 'image').length;
      const newVideoCount = newFiles.filter(f => f.type === 'video').length;
      
      if (type === 'image' && currentImageCount + newImageCount >= maxImages) return;
      if (type === 'video' && currentVideoCount + newVideoCount >= maxVideos) return;
      
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        type
      };
      
      newFiles.push(mediaFile);
    });

    if (newFiles.length > 0) {
      const updatedFiles = [...mediaFiles, ...newFiles];
      setMediaFiles(updatedFiles);
      onMediaChange(updatedFiles);
    }
  };

  const removeMedia = (id: string) => {
    const updatedFiles = mediaFiles.filter(f => {
      if (f.id === id) {
        URL.revokeObjectURL(f.preview);
        return false;
      }
      return true;
    });
    setMediaFiles(updatedFiles);
    onMediaChange(updatedFiles);
  };

  const triggerFileInput = (inputRef: React.RefObject<HTMLInputElement>) => {
    inputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Media Grid Preview */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mediaFiles.map((media) => (
            <div key={media.id} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
              {media.type === 'video' ? (
                <video
                  src={media.preview}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              ) : (
                <img
                  src={media.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => removeMedia(media.id)}
                type="button"
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-1 left-1">
                {media.type === 'video' ? (
                  <Video className="h-4 w-4 text-white drop-shadow-lg" />
                ) : (
                  <Image className="h-4 w-4 text-white drop-shadow-lg" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Buttons */}
      <div className="space-y-3">
        {/* Images */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Image className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">Images</p>
              <p className="text-sm text-gray-500">
                {getImageCount()}/{maxImages} ajoutées
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={getImageCount() >= maxImages}
            onClick={() => triggerFileInput(imageInputRef)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Videos */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Video className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">Vidéos</p>
              <p className="text-sm text-gray-500">
                {getVideoCount()}/{maxVideos} ajoutées
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={getVideoCount() >= maxVideos}
            onClick={() => triggerFileInput(videoInputRef)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Camera */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => triggerFileInput(cameraInputRef)}
        >
          <Camera className="h-4 w-4 mr-2" />
          Prendre une photo
        </Button>
      </div>

      {/* Hidden file inputs */}
      <Input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, 'image')}
      />

      <Input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, 'video')}
      />

      <Input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, 'camera')}
      />
    </div>
  );
};

export default MultiMediaPicker;
