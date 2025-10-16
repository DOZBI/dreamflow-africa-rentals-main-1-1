
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useConversation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const findOrCreateConversation = async (listingId: string, sellerId: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsCreating(true);

    try {
      // D'abord, essayer de trouver une conversation existante
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
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
        .from('conversations')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
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
