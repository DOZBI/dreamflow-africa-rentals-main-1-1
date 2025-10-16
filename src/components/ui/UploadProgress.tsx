import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface UploadProgressProps {
  progress: number; // 0 to 1
  isVisible: boolean;
}

export const UploadProgress = ({ progress, isVisible }: UploadProgressProps) => {
  if (!isVisible) return null;

  const percentage = Math.round(progress * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-[90%] shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-center mb-4">
          Publication en cours...
        </h3>
        <Progress value={percentage} className="h-3 mb-2" />
        <p className="text-center text-sm text-gray-600">
          {percentage}%
        </p>
        <p className="text-center text-xs text-gray-500 mt-2">
          {percentage < 30 && 'Compression des médias...'}
          {percentage >= 30 && percentage < 70 && 'Téléchargement...'}
          {percentage >= 70 && 'Finalisation...'}
        </p>
      </div>
    </div>
  );
};