import {
  DashboardOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ScreenConfig, RouteId, BusinessType } from '@/types/routes';
import { UserRole } from '@/types/auth';
import { Dashboard } from '@/pages/Dashboard';
import { Bookings } from '@/pages/Bookings';
import { Customers } from '@/pages/Customers';
import { Unauthorized } from '@/pages/Unauthorized';

export const routesConfig: ScreenConfig[] = [
  {
    id: RouteId.DASHBOARD,
    path: '/',
    title: 'Dashboard',
    component: Dashboard,
    roles: [UserRole.ADMIN, UserRole.STAFF],
    icon: <DashboardOutlined />,
    showInNav: true,
    businessType: BusinessType.RESTAURANT,
  },
  {
    id: RouteId.BOOKINGS,
    path: '/bookings',
    title: 'Bookings',
    component: Bookings,
    roles: [UserRole.ADMIN, UserRole.STAFF],
    icon: <CalendarOutlined />,
    showInNav: true,
    businessType: BusinessType.RESTAURANT,
  },
  {
    id: RouteId.CUSTOMERS,
    path: '/customers',
    title: 'Customers',
    component: Customers,
    roles: [UserRole.ADMIN, UserRole.STAFF],
    icon: <UserOutlined />,
    showInNav: true,
    businessType: BusinessType.BEAUTY_SALON,
  },
  {
    id: RouteId.UNAUTHORIZED,
    path: '/unauthorized',
    title: 'Unauthorized',
    component: Unauthorized,
    roles: [UserRole.ADMIN, UserRole.STAFF],
    showInNav: false,
  },
];
