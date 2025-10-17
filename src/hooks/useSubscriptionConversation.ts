import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSMSAuth } from '@/contexts/SMSAuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionConversation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { code } = useSMSAuth();
  const { toast } = useToast();

  const findOrCreateConversation = async (listingId: string, sellerCode: string) => {
    if (!code) {
      throw new Error('User must be authenticated with subscription code');
    }

    if (code === sellerCode) {
      throw new Error('Cannot chat with yourself');
    }

    setIsCreating(true);

    try {
      // D'abord, essayer de trouver une conversation existante
      const { data: existingConversation, error: searchError } = await supabase
        .from('subscription_conversations')
        .select('id')
        .eq('buyer_code', code)
        .eq('seller_code', sellerCode)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for conversation:', searchError);
        throw searchError;
      }

      if (existingConversation) {
        return existingConversation.id;
      }

      // Si aucune conversation n'existe, en créer une nouvelle
      const { data: newConversation, error: createError } = await supabase
        .from('subscription_conversations')
        .insert({
          buyer_code: code,
          seller_code: sellerCode,
          listing_id: listingId,
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw createError;
      }

      return newConversation.id;
    } catch (error) {
      console.error('Error in findOrCreateConversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    findOrCreateConversation,
    isCreating,
  };
};