import { createBrowserRouter } from 'react-router-dom';

// Public pages
import PublicHome from '../pages/public/Home';
import Results from '../pages/public/Results';
import ResultDetail from '../pages/public/ResultDetail';
import Groups from '../pages/public/Groups';
import Participants from '../pages/public/Participants';
import ParticipantDetail from '../pages/public/ParticipantDetail';
import FestGallery from '../pages/public/FestGallery';
import ProAnalytics from '../pages/public/ProAnalytics';

// Admin pages
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminCompetitions from '../pages/admin/Competitions';
import AdminGroups from '../pages/admin/Groups';
import AdminStudents from '../pages/admin/Students';
import AdminResults from '../pages/admin/Results';
import AdminPosters from '../pages/admin/Posters';
import AdminGallery from '../pages/admin/Gallery';
import AdminShell from '../components/admincomponents/layout/AdminShell';
import PublicShell from '../components/publiccomponents/layout/PublicShell';

const router = createBrowserRouter([
  // ── Public routes ──
  {
    path: '/',
    element: <PublicShell />,
    children: [
      {
        index: true,
        element: <PublicHome />,
      },
      {
        path: 'results',
        element: <Results />,
      },
      {
        path: 'results/:id',
        element: <ResultDetail />,
      },
      {
        path: 'groups',
        element: <Groups />,
      },
      {
        path: 'participants',
        element: <Participants />,
      },
      {
        path: 'participants/:id',
        element: <ParticipantDetail />,
      },
      {
        path: 'festgallery',
        element: <FestGallery />,
      },
    ]
  },

  // ── Dedicated Pro Analytics Display Scoreboard Page ──
  {
    path: '/analytics',
    element: <ProAnalytics />,
  },
  {
    path: '/scoreboard',
    element: <ProAnalytics />,
  },

  // ── Admin routes ──
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'competitions',
        element: <AdminCompetitions />,
      },
      {
        path: 'groups',
        element: <AdminGroups />,
      },
      {
        path: 'students',
        element: <AdminStudents />,
      },
      {
        path: 'results',
        element: <AdminResults />,
      },
      {
        path: 'posters',
        element: <AdminPosters />,
      },
      {
        path: 'gallery',
        element: <AdminGallery />,
      },
      // Additional admin routes will be added in later phases as children of AdminShell
    ],
  },
]);

export default router;
