import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User, Edit, Heart, MessageCircle, History, AlertTriangle, List } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import UserListings from './UserListings';
import AvatarUpload from './AvatarUpload';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Vous devez être connecté pour voir cette page</p>
      </div>
    );
  }

  // Check if email is confirmed
  const isEmailConfirmed = user.email_confirmed_at != null;
  const daysRemaining = 5; // Mock calculation

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AvatarUpload
              currentAvatarUrl={user.user_metadata?.avatar_url}
              size="lg"
            />
            <div>
              <h1 className="text-xl font-bold">
                {user.user_metadata?.full_name || 'Utilisateur'}
              </h1>
              <p className="text-primary-foreground/80">{user.email}</p>
              {user.user_metadata?.location && (
                <p className="text-primary-foreground/70 text-sm">
                  📍 {user.user_metadata.location}
                </p>
              )}
              {user.phone && (
                <p className="text-primary-foreground/70 text-sm">
                  📞 {user.phone}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Email Verification Warning */}
      {!isEmailConfirmed && (
        <div className="mx-4 mt-4 p-3 bg-accent border border-primary/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Confirmez votre email
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Il vous reste {daysRemaining} jours pour confirmer votre email. 
                Passé ce délai, votre compte sera supprimé.
              </p>
              <Button variant="link" size="sm" className="text-primary p-0 h-auto mt-1">
                Renvoyer l'email de confirmation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="listings">Mes annonces</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Annonces</div>
                </CardContent>
              </Card>
              <Link to="/favorites" className="text-center">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">5</div>
                    <div className="text-sm text-muted-foreground">Favoris</div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/messages" className="text-center">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground">Messages</div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nom complet</span>
                  <span className="font-medium">{user.user_metadata?.full_name || 'Non renseigné'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Téléphone</span>
                  <span className="font-medium">{user.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Localisation</span>
                  <span className="font-medium">{user.user_metadata?.location || 'Non renseigné'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membre depuis</span>
                  <span className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <div className="space-y-2">
              <Card className="cursor-pointer hover:bg-accent" onClick={() => setIsEditModalOpen(true)}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Edit className="h-5 w-5 text-muted-foreground" />
                    <span>Modifier le profil</span>
                  </div>
                </CardContent>
              </Card>

              <Link to="/favorites">
                <Card className="cursor-pointer hover:bg-accent">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5 text-muted-foreground" />
                        <span>Mes favoris</span>
                      </div>
                      <Badge variant="secondary">5</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/messages">
                <Card className="cursor-pointer hover:bg-accent">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                        <span>Mes conversations</span>
                      </div>
                      <Badge variant="secondary">3</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="cursor-pointer hover:bg-accent">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <span>Paramètres</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sign Out Button */}
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            <UserListings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;