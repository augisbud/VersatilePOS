import { HomeOutlined, ShopOutlined } from '@ant-design/icons';
import { ScreenConfig, RouteId } from '@/types/routes';
import { Unauthorized } from '@/pages/Unauthorized';
import { Business } from '@/pages/Business';
import { Overview } from '@/pages/Overview';

export const routesConfig: ScreenConfig[] = [
  {
    id: RouteId.OVERVIEW,
    path: '/',
    title: 'Overview',
    component: Overview,
    roles: [],
    icon: <HomeOutlined />,
    showInNav: true,
  },
  {
    id: RouteId.BUSINESS,
    path: '/business',
    title: 'My Businesses',
    component: Business,
    roles: [],
    icon: <ShopOutlined />,
    showInNav: true,
  },
  {
    id: RouteId.UNAUTHORIZED,
    path: '/unauthorized',
    title: 'Unauthorized',
    component: Unauthorized,
    roles: [],
    showInNav: false,
  },
];
