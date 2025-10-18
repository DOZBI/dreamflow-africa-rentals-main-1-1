import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModernChatInterface } from '@/components/chat/ModernChatInterface';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  updated_at: string;
  listings: {
    title: string;
  };
  buyer_profile: {
    full_name: string;
    avatar_url: string | null;
  };
  seller_profile: {
    full_name: string;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

export const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchConversations();
      setupRealtimeSubscription();
      
      const listingId = searchParams.get('listing');
      if (listingId) {
        createOrFindConversationForListing(listingId);
      }
    }
    
    return () => {
      // Cleanup handled by Supabase
    };
  }, [user]);

  const createOrFindConversationForListing = async (listingId: string) => {
    if (!user) return;

    try {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, user_id')
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;

      if (listing.user_id === user.id) {
        toast({
          title: "Erreur",
          description: "Vous ne pouvez pas contacter votre propre annonce",
          variant: "destructive",
        });
        setSearchParams({});
        return;
      }

      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', listing.user_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingConv) {
        setSelectedConversationId(existingConv.id);
        setSearchParams({});
      } else {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: listing.user_id,
          })
          .select('id')
          .single();

        if (createError) throw createError;

        setSelectedConversationId(newConv.id);
        setSearchParams({});
        
        toast({
          title: "Conversation créée",
          description: "Vous pouvez maintenant discuter avec le vendeur",
        });
        
        fetchConversations();
      }
    } catch (error) {
      console.error('Error creating/finding conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
      setSearchParams({});
    }
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          buyer_id,
          seller_id,
          listing_id,
          updated_at,
          created_at,
          listings!conversations_listing_id_fkey (
            title
          ),
          buyer_profile:profiles!conversations_buyer_id_fkey (
            full_name,
            avatar_url
          ),
          seller_profile:profiles!conversations_seller_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .or(`buyer_id.eq.${user?.id},seller_id.eq.${user?.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            last_message: lastMsg || undefined,
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const conversationsChannel = supabase
      .channel('user_conversations_page')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: `buyer_id=eq.${user?.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations',
          filter: `seller_id=eq.${user?.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  };

  const getOtherUser = (conversation: Conversation) => {
    if (user?.id === conversation.buyer_id) {
      return conversation.seller_profile;
    }
    return conversation.buyer_profile;
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedConversationId) {
    return (
      <div className="h-screen overflow-hidden">
        <ModernChatInterface
          conversationId={selectedConversationId}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="p-4 border-b bg-[#008069] text-white">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6" />
          <h1 className="text-lg font-semibold">Mes conversations</h1>
        </div>
      </div>

      <div className="flex-1">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune conversation</p>
            <p className="text-gray-400 text-sm mt-2">
              Contactez un propriétaire pour commencer une discussion
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessageTime = conversation.last_message
              ? new Date(conversation.last_message.created_at)
              : new Date(conversation.updated_at);
            
            const isToday = new Date().toDateString() === lastMessageTime.toDateString();
            const timeDisplay = isToday
              ? format(lastMessageTime, 'HH:mm', { locale: fr })
              : format(lastMessageTime, 'dd/MM/yyyy', { locale: fr });

            return (
              <div
                key={conversation.id}
                className="p-4 border-b cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => setSelectedConversationId(conversation.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {otherUser.avatar_url ? (
                      <img
                        src={otherUser.avatar_url}
                        alt={otherUser.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      otherUser.full_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {otherUser.full_name}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {timeDisplay}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-0.5">
                      {conversation.listings.title}
                    </p>
                    {conversation.last_message && (
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};