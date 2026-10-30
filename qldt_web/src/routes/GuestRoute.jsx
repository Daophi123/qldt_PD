import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { FullPageLoader } from '../components/ui/FullPageLoader';

export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') return <FullPageLoader />
  if (status === 'authenticated') {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search ?? ''}` : '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}