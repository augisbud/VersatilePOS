import { useUser } from '@/hooks/useUser';
import { DashboardLayout } from './DashboardLayout';
import { Navigate, Outlet } from 'react-router';
import { RouteId } from '@/types/routes';

export const AuthGateway = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to={`/${RouteId.LOGIN}`} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};
