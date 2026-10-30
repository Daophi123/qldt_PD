import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { FullPageLoader } from '../components/ui/FullPageLoader';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if(status === 'checking') return <FullPageLoader />
  if(status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />;
}