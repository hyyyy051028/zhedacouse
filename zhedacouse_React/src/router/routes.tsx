import { lazy } from 'react';
import { Navigate, type RouteObject, useLocation } from 'react-router-dom';

const Home = lazy(() => import('../pages/Home'));
const Register = lazy(() => import('../pages/Register'));

function NotFoundRedirect() {
  const location = useLocation();
  const suffix = `${location.search || ''}${location.hash || ''}`;
  return <Navigate to={`/${suffix}`} replace />;
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '*',
    element: <NotFoundRedirect />,
  },
];
