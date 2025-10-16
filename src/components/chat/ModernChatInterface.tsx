import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MoreVertical, Phone, Video, Search, Play, Pause, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ModernChatInput } from './ModernChatInput';
import { slideUpVariants, staggerContainerVariants, staggerItemVariants, fadeVariants, scaleVariants, gpuStyles } from '@/lib/animations';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  message_type: string | null;
  audio_url: string | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
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
}

interface ModernChatInterfaceProps {
  conversationId?: string;
  onBack?: () => void;
}

export const ModernChatInterface = ({ conversationId, onBack }: ModernChatInterfaceProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesChannelRef = useRef<any>(null);
  const conversationsChannelRef = useRef<any>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchConversations();
      setupConversationsSubscription();
    }
    
    return () => {
      if (messagesChannelRef.current) {
        supabase.removeChannel(messagesChannelRef.current);
      }
      if (conversationsChannelRef.current) {
        supabase.removeChannel(conversationsChannelRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    if (conversationId) {
      fetchSpecificConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      setupMessagesSubscription(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupConversationsSubscription = () => {
    if (conversationsChannelRef.current) {
      supabase.removeChannel(conversationsChannelRef.current);
    }

    conversationsChannelRef.current = supabase
      .channel('user_conversations')
      .on(
        'postgres_changes',
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
      .on(
        'postgres_changes',
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
      .subscribe();
  };

  const setupMessagesSubscription = (convId: string) => {
    if (messagesChannelRef.current) {
      supabase.removeChannel(messagesChannelRef.current);
    }

    messagesChannelRef.current = supabase
      .channel(`messages_${convId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${convId}`
        },
        (payload) => {
          addNewMessage(payload.new as any);
        }
      )
      .subscribe();
  };

  const addNewMessage = async (newMessageData: any) => {
    const { data: completeMessage, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        message_type,
        audio_url,
        profiles!messages_sender_id_fkey (
          full_name,
          avatar_url
        )
      `)
      .eq('id', newMessageData.id)
      .single();

    if (error) {
      console.error('Error fetching complete message:', error);
      return;
    }

    setMessages(prevMessages => {
      const exists = prevMessages.some(msg => msg.id === completeMessage.id);
      if (exists) return prevMessages;
      return [...prevMessages, completeMessage];
    });
  };

  const fetchSpecificConversation = async (convId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          buyer_id,
          seller_id,
          listing_id,
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
        .eq('id', convId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedConversation(data);
      }
    } catch (error) {
      console.error('Error fetching specific conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la conversation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (convId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          message_type,
          audio_url,
          profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!user || !selectedConversation) return;

    setIsSending(true);

    // Optimistic update - ajouter le message immédiatement
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      created_at: new Date().toISOString(),
      sender_id: user.id,
      message_type: 'text',
      audio_url: null,
      profiles: {
        full_name: user.user_metadata?.full_name || 'Vous',
        avatar_url: user.user_metadata?.avatar_url || null,
      },
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: messageContent,
          message_type: 'text',
        })
        .select(`
          id,
          content,
          created_at,
          sender_id,
          message_type,
          audio_url,
          profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Remplacer le message temporaire par le vrai message
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? data : msg
      ));

      // Ne plus mettre à jour updated_at manuellement - sera géré par trigger SQL

    } catch (error) {
      console.error('Error sending message:', error);
      // Retirer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [user, selectedConversation, toast]);

  const sendVoiceMessage = useCallback(async (audioBlob: Blob) => {
    if (!user || !selectedConversation) return;

    setIsSending(true);

    // Optimistic update pour note vocale
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content: '🎤 Note vocale',
      created_at: new Date().toISOString(),
      sender_id: user.id,
      message_type: 'audio',
      audio_url: null,
      profiles: {
        full_name: user.user_metadata?.full_name || 'Vous',
        avatar_url: user.user_metadata?.avatar_url || null,
      },
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(fileName);

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: '🎤 Note vocale',
          message_type: 'audio',
          audio_url: urlData.publicUrl,
        })
        .select(`
          id,
          content,
          created_at,
          sender_id,
          message_type,
          audio_url,
          profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (insertError) throw insertError;

      // Remplacer le message temporaire par le vrai message
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? data : msg
      ));

      // Ne plus mettre à jour updated_at manuellement - sera géré par trigger SQL

      toast({
        title: "Succès",
        description: "Note vocale envoyée",
      });

    } catch (error) {
      console.error('Error sending voice message:', error);
      // Retirer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la note vocale",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }, [user, selectedConversation, toast]);

  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    const audio = audioRefs.current.get(messageId) || new Audio(audioUrl);
    
    if (!audioRefs.current.has(messageId)) {
      audioRefs.current.set(messageId, audio);
      audio.addEventListener('ended', () => {
        setPlayingAudioId(null);
      });
    }

    if (playingAudioId === messageId) {
      audio.pause();
      setPlayingAudioId(null);
    } else {
      audioRefs.current.forEach((a, id) => {
        if (id !== messageId) {
          a.pause();
        }
      });
      audio.play();
      setPlayingAudioId(messageId);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    if (user?.id === conversation.buyer_id) {
      return conversation.seller_profile;
    }
    return conversation.buyer_profile;
  };

  if (conversationId && !selectedConversation && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div 
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          style={gpuStyles}
          className="text-center space-y-3"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  if (!selectedConversation) {
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-card">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Messages</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Conversations List with GPU animations */}
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <motion.div 
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              style={gpuStyles}
              className="flex flex-col items-center justify-center h-full px-6 py-12"
            >
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucune conversation</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Commencez à discuter avec les vendeurs et acheteurs pour que vos conversations apparaissent ici
              </p>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              style={gpuStyles}
              className="divide-y"
            >
              <AnimatePresence mode="popLayout">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  return (
                    <motion.button
                      key={conversation.id}
                      variants={staggerItemVariants}
                      layout
                      whileTap={{ scale: 0.98 }}
                      style={gpuStyles}
                      className="w-full p-4 hover:bg-muted/50 transition-colors text-left flex items-center gap-4"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <Avatar className="h-14 w-14 border-2 border-background">
                        <AvatarImage src={otherUser.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                          {otherUser.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-base truncate">{otherUser.full_name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.listings.title}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </ScrollArea>
      </div>
    );
  }

  const otherUser = getOtherUser(selectedConversation);

  return (
    <div className="flex flex-col h-screen bg-background" style={gpuStyles}>
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-card">
        <div className="flex items-center gap-3 px-4 py-3">
          {onBack && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 border-2 border-background">
            <AvatarImage src={otherUser.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {otherUser.full_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{otherUser.full_name}</h2>
            <p className="text-xs text-muted-foreground truncate">{selectedConversation.listings.title}</p>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Video className="h-4 w-4" />
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Info className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Détails de la conversation</SheetTitle>
                  <SheetDescription>
                    Informations sur cette discussion
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-background">
                      <AvatarImage src={otherUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                        {otherUser.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold">{otherUser.full_name}</h3>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">À propos de l'annonce</h4>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm">{selectedConversation.listings.title}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Messages Container with GPU animations */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="px-4 py-4 space-y-4">
            {isLoading ? (
              <motion.div 
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                style={gpuStyles}
                className="flex items-center justify-center h-full py-12"
              >
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </motion.div>
            ) : messages.length === 0 ? (
              <motion.div 
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                style={gpuStyles}
                className="flex flex-col items-center justify-center h-full py-12 text-center"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Commencez la conversation</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Envoyez votre premier message pour démarrer la discussion
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender_id === user?.id;
                  const showTime = index === 0 || 
                    new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000;
                  
                  const isAudioMessage = message.message_type === 'audio' && message.audio_url;
                  
                  return (
                    <motion.div 
                      key={message.id}
                      variants={slideUpVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      style={gpuStyles}
                    >
                      {showTime && (
                        <div className="flex justify-center my-4">
                          <Badge variant="secondary" className="text-xs">
                            {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                          </Badge>
                        </div>
                      )}
                      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <Card className={`max-w-[75%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : ''}`}>
                          <CardContent className="p-3">
                            {isAudioMessage ? (
                              <div className="flex items-center gap-3 min-w-[220px]">
                                <Button
                                  size="icon"
                                  variant={isCurrentUser ? "secondary" : "ghost"}
                                  onClick={() => toggleAudioPlayback(message.id, message.audio_url!)}
                                  className="h-10 w-10 rounded-full flex-shrink-0"
                                >
                                  {playingAudioId === message.id ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <div className="flex-1">
                                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div className="h-1 bg-primary w-0"></div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            )}
                            <p className={`text-xs mt-2 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Container */}
      <div className="flex-shrink-0">
        <ModernChatInput
          onSendMessage={sendMessage}
          onSendVoice={sendVoiceMessage}
          disabled={isSending}
          placeholder="Tapez votre message..."
        />
      </div>
    </div>
  );
};