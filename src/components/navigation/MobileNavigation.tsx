import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, MessageCircle, Heart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/create', icon: Plus, label: 'Créer' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/favorites', icon: Heart, label: 'Favoris' },
    { path: '/profile', icon: User, label: 'Profil' }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 safe-area-inset-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-dreamflow scale-105'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;