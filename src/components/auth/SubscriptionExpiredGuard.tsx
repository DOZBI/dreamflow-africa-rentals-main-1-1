import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSMSAuth } from '@/contexts/SMSAuthContext';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionExpiredGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, checkTokenValidity, expiresAt } = useSMSAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Ne vérifier que si l'utilisateur est authentifié
    if (!isAuthenticated) return;

    // Vérifier immédiatement
    if (!checkTokenValidity()) {
      toast({
        title: "Abonnement expiré",
        description: "Votre abonnement a expiré. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      navigate('/login', { replace: true });
      return;
    }

    // Vérifier toutes les 30 secondes
    const interval = setInterval(() => {
      if (!checkTokenValidity()) {
        toast({
          title: "Abonnement expiré",
          description: "Votre abonnement a expiré. Veuillez vous reconnecter.",
          variant: "destructive",
        });
        navigate('/login', { replace: true });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenValidity, navigate, toast]);

  // Afficher un avertissement 10 minutes avant l'expiration
  useEffect(() => {
    if (!expiresAt || !isAuthenticated) return;

    const checkWarning = () => {
      const now = new Date();
      const timeLeft = expiresAt.getTime() - now.getTime();
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));

      if (minutesLeft === 10) {
        toast({
          title: "Abonnement bientôt expiré",
          description: "Votre abonnement expire dans 10 minutes.",
          variant: "default",
        });
      } else if (minutesLeft === 5) {
        toast({
          title: "Abonnement bientôt expiré",
          description: "Votre abonnement expire dans 5 minutes.",
          variant: "default",
        });
      } else if (minutesLeft === 1) {
        toast({
          title: "Abonnement bientôt expiré",
          description: "Votre abonnement expire dans 1 minute.",
          variant: "destructive",
        });
      }
    };

    const interval = setInterval(checkWarning, 60000);
    checkWarning();

    return () => clearInterval(interval);
  }, [expiresAt, isAuthenticated, toast]);

  // Toujours rendre les enfants - laisser AppRoutes gérer la protection
  return <>{children}</>;
};