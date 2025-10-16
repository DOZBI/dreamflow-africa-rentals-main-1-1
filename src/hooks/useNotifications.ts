import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (user && isSupported && permission === 'granted') {
      registerServiceWorker();
      setupNotificationSubscription();
    }
  }, [user, isSupported, permission]);

  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('Service Worker enregistré:', registration);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
    }
  };

  const setupNotificationSubscription = () => {
    if (!user) return;

    // S'abonner aux nouveaux messages pour cet utilisateur
    const channel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const message = payload.new as any;
          
          // Ne pas notifier si c'est l'utilisateur qui envoie le message
          if (message.sender_id === user.id) return;

          // Récupérer les détails du message et de la conversation
          const { data: messageData } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              conversation_id,
              profiles!messages_sender_id_fkey (
                full_name
              )
            `)
            .eq('id', message.id)
            .single();

          if (!messageData) return;

          // Vérifier si l'utilisateur est impliqué dans cette conversation
          const { data: conversation } = await supabase
            .from('conversations')
            .select('id, buyer_id, seller_id')
            .eq('id', messageData.conversation_id)
            .single();

          if (!conversation) return;

          const isUserInConversation = 
            conversation.buyer_id === user.id || conversation.seller_id === user.id;

          if (!isUserInConversation) return;

          // Afficher la notification
          showNotification(
            messageData.profiles.full_name || 'Nouveau message',
            messageData.content.substring(0, 100),
            `/messages?conversation=${messageData.conversation_id}`
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "Les notifications ne sont pas supportées sur ce navigateur",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des notifications pour les nouveaux messages",
        });
        await registerServiceWorker();
        setupNotificationSubscription();
        return true;
      } else if (result === 'denied') {
        toast({
          title: "Notifications refusées",
          description: "Vous devez autoriser les notifications dans les paramètres de votre navigateur",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de demander la permission pour les notifications",
        variant: "destructive",
      });
      return false;
    }
    return false;
  };

  const showNotification = (title: string, body: string, url?: string) => {
    if (permission !== 'granted') return;

    // Vérifier si la fenêtre est au premier plan
    if (document.visibilityState === 'visible' && document.hasFocus()) {
      // Ne pas afficher de notification si l'utilisateur est déjà sur la page
      return;
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Utiliser le service worker pour afficher la notification
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: '/vite.svg',
          badge: '/vite.svg',
          data: { url },
          tag: 'chat-notification',
          requireInteraction: false,
          vibrate: [200, 100, 200],
        });
      });
    } else {
      // Fallback : utiliser l'API Notification directement
      new Notification(title, {
        body,
        icon: '/vite.svg',
        data: { url },
      });
    }
  };

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
};