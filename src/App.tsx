import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import EnhancedAuthPage from "@/components/auth/EnhancedAuthPage";
import MarketplaceFeed from "@/components/marketplace/MarketplaceFeed";
import CreateListingPage from "@/components/marketplace/CreateListingPage";
import ProfilePage from "@/components/profile/ProfilePage";
import { MessagesPage } from "@/pages/MessagesPage";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import SplashScreen from "@/components/SplashScreen";
import FavoritesPage from "@/pages/FavoritesPage";
import ListingDetailPage from "@/pages/ListingDetailPage";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/auth" element={<EnhancedAuthPage />} />
        <Route path="/" element={<MarketplaceFeed />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/create" element={
          <ProtectedRoute>
            <CreateListingPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } />

        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />
      </Routes>
      {user && <MobileNavigation />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HoverReceiver />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;