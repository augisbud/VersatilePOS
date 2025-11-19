import { Routes, Route, Navigate } from 'react-router-dom';
import { routesConfig } from '@/config/routes.config';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { getRoutesForBusinessType } from '@/utils/routes';
import { AuthGateway } from '@/layouts/AuthGateway';
import { RouteId } from '@/types/routes';
import { NotFound } from '@/pages/NotFound';
import { Register } from '@/pages/Register';
import { Login } from '@/pages/Login';

interface ProtectedRouteProps {
  element: React.ComponentType;
  roles: UserRole[];
}

const ProtectedRoute = ({ element: Component, roles }: ProtectedRouteProps) => {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <Navigate to={RouteId.UNAUTHORIZED} />;
  }

  return <Component />;
};

export const AppRouter = () => {
  const { businessType } = useAuth();

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
            element={
              <ProtectedRoute element={route.component} roles={route.roles} />
            }
          />
        ))}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
