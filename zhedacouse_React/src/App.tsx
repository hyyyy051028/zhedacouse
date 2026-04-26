import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { routes } from './router';

function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </Suspense>
  );
}

export default App;
