import { createBrowserRouter } from 'react-router';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { NAV_LINKS } from './navigation';
import { AppLayout } from '../layouts/AppLayout/AppLayout';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { HomePage } from '../pages/HomePage/HomePage';
import { ComingSoonPage } from '../pages/ComingSoonPage/ComingSoonPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';
import { NewsPage } from '../pages/NewsPage/NewsPage';
import { NewsPlaceholder } from '../pages/NewsPage/NewsPlaceholder';
import { NewsReader } from '../pages/NewsPage/NewsReader';
import { ClassSchedulePage } from '../pages/ClassSchedulePage/ClassSchedulePage';
import { DocumentPage } from '../pages/DocumentPage/DocumentPage';
import { ExamSchedulePage } from '../pages/ExamSchedulePage/ExamSchedulePage';
import { ProgramPage } from '../pages/ProgramPage/ProgramPage';
import { GradePage } from '../pages/GradePage/GradePage';

const BUILT_PATHS = ['/', '/news', '/schedule/class', '/document', '/schedule/exam', '/study-corner/program', '/study-corner/grade']
const comingSoonRoutes = NAV_LINKS.filter(link => !BUILT_PATHS.includes(link.to)).map(link => ({ path: link.to, element: <ComingSoonPage /> }))

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
          {
            path: 'news', element: <NewsPage />,
            children: [
              { index: true, element: <NewsPlaceholder /> },
              { path: ':newsId', element: <NewsReader /> }
            ]
          },
          { path: 'schedule/class', element: <ClassSchedulePage /> },
          { path: 'document', element: <DocumentPage /> },
          { path: 'schedule/exam', element: <ExamSchedulePage /> },
          { path: 'study-corner/program', element: <ProgramPage /> },
          { path: 'study-corner/grade', element: <GradePage /> },
          ...comingSoonRoutes
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> }
])