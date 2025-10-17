import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SMSAuthProvider } from './contexts/SMSAuthContext';
import { SubscriptionExpiredGuard } from './components/auth/SubscriptionExpiredGuard';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SMSAuthProvider>
          <SubscriptionExpiredGuard>
            <AppRoutes />
          </SubscriptionExpiredGuard>
        </SMSAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;