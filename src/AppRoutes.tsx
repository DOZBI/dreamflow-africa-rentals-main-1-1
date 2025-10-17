import { Routes, Route, Navigate } from 'react-router-dom';
import { useSMSAuth } from './contexts/SMSAuthContext';
import Index from './pages/Index';
import MobilePage from './pages/MobilePage';
import ListingDetailPage from './pages/ListingDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import MessagesPage from './pages/MessagesPage';
import VideoFeedPage from './pages/VideoFeedPage';
import NotFound from './pages/NotFound';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSMSAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function AppRoutes() {
  const { isAuthenticated } = useSMSAuth();
  
  return (
    <Routes>
      {/* Public route - Login page */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <MobilePage />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/listing/:id" 
        element={
          <ProtectedRoute>
            <ListingDetailPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/favorites" 
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/videos" 
        element={
          <ProtectedRoute>
            <VideoFeedPage />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}