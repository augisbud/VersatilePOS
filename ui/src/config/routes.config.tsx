import {
  CalendarOutlined,
  HomeOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { ScreenConfig, RouteId } from '@/types/routes';
import { Unauthorized } from '@/pages/Unauthorized';
import { Business } from '@/pages/Business';
import { Overview } from '@/pages/Overview';
import { Reservations } from '@/pages/Reservations';
import { NewReservation } from '@/pages/NewReservation';

export const routesConfig: ScreenConfig[] = [
  {
    id: RouteId.OVERVIEW,
    path: '/',
    title: 'Overview',
    component: Overview,
    icon: <HomeOutlined />,
    showInNav: true,
  },
  {
    id: RouteId.UNAUTHORIZED,
    path: '/unauthorized',
    title: 'Unauthorized',
    component: Unauthorized,
    showInNav: false,
  },
  {
    id: RouteId.RESERVATIONS,
    path: '/reservations',
    title: 'Reservations',
    component: Reservations,
    icon: <CalendarOutlined />,
    showInNav: true,
  },
  {
    id: RouteId.NEW_RESERVATION,
    path: '/reservations/new',
    title: 'New Reservation',
    component: NewReservation,
    showInNav: false,
    parentPage: RouteId.RESERVATIONS,
  },
  {
    id: RouteId.BUSINESS,
    path: '/business',
    title: 'My Businesses',
    component: Business,
    icon: <ShopOutlined />,
    showInNav: true,
  },
];
