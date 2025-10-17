import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SMSAuthProvider, useSMSAuth } from "@/contexts/SMSAuthContext";
import EnhancedAuthPage from "@/components/auth/EnhancedAuthPage";
import { SMSLoginForm } from "@/components/auth/SMSLoginForm";
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
  const { isAuthenticated } = useSMSAuth();
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useSMSAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/auth" element={
          isAuthenticated ? <Navigate to="/" replace /> : <SMSLoginForm />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <MarketplaceFeed />
          </ProtectedRoute>
        } />
        <Route path="/listing/:id" element={
          <ProtectedRoute>
            <ListingDetailPage />
          </ProtectedRoute>
        } />
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
      {isAuthenticated && <MobileNavigation />}
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
          <SMSAuthProvider>
            <AppRoutes />
          </SMSAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;