import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from './DashboardLayout';
import { Navigate, Outlet } from 'react-router-dom';
import { RouteId } from '@/types/routes';

export const AuthGateway = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={RouteId.LOGIN} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
