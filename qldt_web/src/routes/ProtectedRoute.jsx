import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { FullPageLoader } from '../components/ui/FullPageLoader';

const NO_RETURN_PATHS = ['/change-password'];

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if(status === 'checking') return <FullPageLoader />
  if(status === 'guest') {
    const from = NO_RETURN_PATHS.includes(location.pathname) ? undefined : location;
    return <Navigate to="/login" replace state={from ? { from } : undefined} />
  }
  return <Outlet />;
}