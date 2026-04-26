import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

const Home = lazy(() => import('../pages/Home'));
const Register = lazy(() => import('../pages/Register'));

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
    path: '/:teacherKey',
    element: <Home />,
  },
  {
    path: '/:teacherKey/register',
    element: <Register />,
  },
];
