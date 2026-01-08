import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isBusinessUser } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isBusiness = isBusinessUser();
  
  if (!isAuthenticated()) {
    // Redirect to appropriate auth page if not authenticated
    return <Navigate to={isBusiness ? "/business-login" : "/auth"} replace />;
  }

  // Business users can only access /business/* routes
  if (isBusiness && !location.pathname.startsWith('/business')) {
    return <Navigate to="/business/dashboard" replace />;
  }

  // Regular users cannot access /business/* routes
  if (!isBusiness && location.pathname.startsWith('/business')) {
    return <Navigate to="/wallet" replace />;
  }

  return <>{children}</>;
}

