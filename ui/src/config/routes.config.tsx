import { HomeOutlined } from '@ant-design/icons';
import { ScreenConfig, RouteId } from '@/types/routes';
import { UserRole } from '@/types/auth';
import { Unauthorized } from '@/pages/Unauthorized';
import { Business } from '@/pages/Business';
import { Overview } from '@/pages/Overview';

export const routesConfig: ScreenConfig[] = [
  {
    id: RouteId.OVERVIEW,
    path: '/',
    title: 'Overview',
    component: Overview,
    roles: [UserRole.ADMIN, UserRole.STAFF],
    icon: <HomeOutlined />,
    showInNav: true,
  },
  {
    id: RouteId.BUSINESS,
    path: '/business',
    title: 'Business',
    component: Business,
    roles: [UserRole.ADMIN],
    icon: <HomeOutlined />,
    showInNav: true,
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
