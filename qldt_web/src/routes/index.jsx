import { createBrowserRouter } from 'react-router';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { NAV_LINKS } from './navigation';
import { AppLayout } from '../layouts/AppLayout/AppLayout';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { HomePage } from '../pages/HomePage/HomePage';
import { ComingSoonPage } from '../pages/ComingSoonPage/ComingSoonPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';

const comingSoonRoutes = NAV_LINKS.filter(link => link.to !== '/').map(link => ({ path: link.to, element: <ComingSoonPage /> }))

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{ path: 'login', element: <LoginPage /> }]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          ...comingSoonRoutes
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> }
])