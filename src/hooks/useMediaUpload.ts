
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface MediaUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const useMediaUpload = ({ onSuccess, onError }: MediaUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadMedia = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate file upload with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock URL using URL.createObjectURL for demo
      const mockUrl = URL.createObjectURL(file);
      
      setUploadProgress(100);
      onSuccess?.(mockUrl);
      
      toast({
        title: "Upload réussi",
        description: "Votre fichier a été uploadé avec succès",
      });

      return mockUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
      onError?.(errorMessage);
      
      toast({
        title: "Erreur d'upload",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadMedia,
    isUploading,
    uploadProgress,
  };
};
