
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type AuthAction = 'like' | 'comment' | 'create' | 'contact' | 'favorite';

export const useAuthAction = () => {
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentAction, setCurrentAction] = useState<AuthAction>('like');

  const executeAction = (action: AuthAction, callback: () => void) => {
    if (user) {
      callback();
    } else {
      setCurrentAction(action);
      setShowLoginPrompt(true);
    }
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  return {
    executeAction,
    showLoginPrompt,
    currentAction,
    closeLoginPrompt,
    isAuthenticated: !!user
  };
};
