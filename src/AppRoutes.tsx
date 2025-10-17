import { Routes, Route, Navigate } from 'react-router-dom';
import { useSMSAuth } from './contexts/SMSAuthContext';
import MobileNavigation from './components/navigation/MobileNavigation';
import SMSLoginPage from './pages/SMSLoginPage';
import Index from './pages/Index';
import ListingDetailPage from './pages/ListingDetailPage';
import MessagesPage from './pages/MessagesPage';
import FavoritesPage from './pages/FavoritesPage';
import VideoFeedPage from './pages/VideoFeedPage';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSMSAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <MobileNavigation />
    </>
  );
};

export const AppRoutes = () => {
  const { isAuthenticated } = useSMSAuth();

  return (
    <Routes>
      {/* Public route - Login */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <SMSLoginPage />} 
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
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
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
        path="/videos"
        element={
          <ProtectedRoute>
            <VideoFeedPage />
          </ProtectedRoute>
        }
      />

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;