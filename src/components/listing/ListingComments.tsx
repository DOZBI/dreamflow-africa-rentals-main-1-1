import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ListingCommentsProps {
  listingId: string;
  onCommentAdded?: () => void;
}

const ListingComments = ({ listingId, onCommentAdded }: ListingCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    
    const channel = supabase
      .channel(`listing_${listingId}_comments`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'listing_comments',
          filter: `listing_id=eq.${listingId}`,
        },
        async (payload) => {
          const { data: newCommentData } = await supabase
            .from('listing_comments')
            .select(`
              id,
              content,
              created_at,
              user_id,
              profiles!listing_comments_user_id_fkey (
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newCommentData) {
            setComments(prev => [newCommentData as Comment, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'listing_comments',
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          setComments(prev => prev.filter(c => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('listing_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles!listing_comments_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('listing_id', listingId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data as Comment[] || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('listing_comments')
        .insert({
          listing_id: listingId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      onCommentAdded?.();
      
      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié avec succès",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('listing_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Commentaire supprimé",
        description: "Le commentaire a été supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden">
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-lg">Commentaires ({comments.length})</h3>
        </div>
      </div>

      {user && (
        <form onSubmit={handleSubmitComment} className="flex-shrink-0 space-y-3 mb-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Envoi...' : 'Publier'}</span>
            </Button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Aucun commentaire pour le moment</p>
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={comment.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {comment.profiles.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {comment.profiles.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    {user?.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-600 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ListingComments;