import { Routes, Route } from 'react-router-dom';
import { routesConfig } from '@/config/routes.config';
import { useUser } from '@/hooks/useUser';
import { getRoutesForBusinessType } from '@/utils/routes';
import { AuthGateway } from '@/layouts/AuthGateway';
import { RouteId } from '@/types/routes';
import { NotFound } from '@/pages/NotFound';
import { Register } from '@/pages/Register';
import { Login } from '@/pages/Login';

interface ProtectedRouteProps {
  element: React.ComponentType;
}

const ProtectedRoute = ({ element: Component }: ProtectedRouteProps) => {
  // if (!hasRole(roles)) {
  //   return <Navigate to={RouteId.UNAUTHORIZED} />;
  // }

  return <Component />;
};

export const AppRouter = () => {
  const { businessType } = useUser();

  const availableRoutes = getRoutesForBusinessType(routesConfig, businessType);

  return (
    <Routes>
      <Route path={RouteId.LOGIN} element={<Login />} />
      <Route path={RouteId.REGISTER} element={<Register />} />
      <Route element={<AuthGateway />}>
        {availableRoutes.map((route) => (
          <Route
            key={route.id}
            path={route.path}
            element={<ProtectedRoute element={route.component} />}
          />
        ))}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
