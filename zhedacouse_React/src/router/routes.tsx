import { lazy } from 'react';
import { Navigate, type RouteObject, useLocation } from 'react-router-dom';

const Home = lazy(() => import('../pages/Home'));
const Register = lazy(() => import('../pages/Register'));
const CourseDetail = lazy(() => import('../pages/CourseDetail'));

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
    path: '/course/:id',
    element: <CourseDetail />,
  },
  {
    path: '*',
    element: <NotFoundRedirect />,
  },
];
