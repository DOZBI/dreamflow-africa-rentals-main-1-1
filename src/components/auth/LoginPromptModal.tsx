
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Heart, MessageCircle, Plus } from 'lucide-react';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'like' | 'comment' | 'create' | 'contact' | 'favorite';
}

const LoginPromptModal = ({ isOpen, onClose, action }: LoginPromptModalProps) => {
  const navigate = useNavigate();

  const actionMessages = {
    like: {
      icon: Heart,
      title: "Aimer cette annonce",
      description: "Connectez-vous pour aimer et sauvegarder vos annonces préférées"
    },
    comment: {
      icon: MessageCircle,
      title: "Commenter",
      description: "Connectez-vous pour participer aux discussions et poser des questions"
    },
    create: {
      icon: Plus,
      title: "Créer une annonce",
      description: "Connectez-vous pour publier vos propres annonces"
    },
    contact: {
      icon: MessageCircle,
      title: "Contacter le vendeur",
      description: "Connectez-vous pour entrer en contact avec les vendeurs"
    },
    favorite: {
      icon: Heart,
      title: "Ajouter aux favoris",
      description: "Connectez-vous pour sauvegarder vos annonces favorites"
    }
  };

  const currentAction = actionMessages[action];
  const Icon = currentAction.icon;

  const handleLogin = () => {
    navigate('/auth?mode=login');
    onClose();
  };

  const handleSignup = () => {
    navigate('/auth?mode=signup');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            {currentAction.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {currentAction.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button 
            onClick={handleLogin}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            <User className="mr-2 h-4 w-4" />
            Se connecter
          </Button>
          
          <Button 
            onClick={handleSignup}
            variant="outline"
            className="w-full h-12"
          >
            Créer un compte
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-500"
          >
            Continuer sans compte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptModal;
