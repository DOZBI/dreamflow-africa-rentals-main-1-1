import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 px-8">
      <div className="text-center space-y-8 animate-fade-in max-w-sm mx-auto">
        {/* Logo Circle */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="text-primary-foreground text-2xl font-bold">🏠</div>
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-wide">
            DAKO
          </h1>
          <h2 className="text-lg font-semibold text-muted-foreground">
            IMMOBILIER
          </h2>
        </div>

        {/* Illustration Area */}
        <div className="w-64 h-48 mx-auto bg-gradient-to-b from-primary/20 to-accent/10 rounded-lg flex items-center justify-center mb-8">
          <div className="text-6xl">🛵</div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            BIENVENUE !
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Trouvez votre logement idéal,<br />
            rapidement et facilement.
          </p>
        </div>

        {/* Loading Progress */}
        <div className="w-full space-y-3">
          <Progress 
            value={progress} 
            className="h-2"
          />
          <div className="flex justify-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${progress > 20 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-2 h-2 rounded-full ${progress > 40 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-2 h-2 rounded-full ${progress > 60 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-2 h-2 rounded-full ${progress > 80 ? 'bg-primary' : 'bg-muted'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;