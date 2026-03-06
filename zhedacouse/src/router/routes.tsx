import { type RouteObject } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/register',
    element: <Register />,
  },
];
