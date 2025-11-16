import { Routes, Route, Navigate } from 'react-router-dom';
import { routesConfig } from '@/config/routes.config';
import { useAuth } from '@/contexts/AuthContext';
import { Typography } from 'antd';
import { UserRole } from '@/types/auth';
import { getRoutesForBusinessType } from '@/utils/routes';

const { Title, Paragraph } = Typography;

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <Title level={1}>404</Title>
    <Paragraph>Page not found</Paragraph>
  </div>
);

const Unauthorized = () => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <Title level={1}>403</Title>
    <Paragraph>You don't have permission to access this page</Paragraph>
  </div>
);

interface ProtectedRouteProps {
  element: React.ComponentType;
  roles: UserRole[];
}

const ProtectedRoute = ({ element: Component, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    // In a real app, redirect to login
    return <Navigate to="/" replace />;
  }

  if (!hasRole(roles)) {
    return <Unauthorized />;
  }

  return <Component />;
};

export const AppRouter = () => {
  const { businessType } = useAuth();

  const availableRoutes = getRoutesForBusinessType(routesConfig, businessType);

  return (
    <Routes>
      {availableRoutes.map((route) => (
        <Route
          key={route.id}
          path={route.path}
          element={
            <ProtectedRoute element={route.component} roles={route.roles} />
          }
        />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
