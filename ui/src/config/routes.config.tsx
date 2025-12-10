import {
  CalendarOutlined,
  HomeOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { ScreenConfig, RouteId } from '@/types/routes';
import { Unauthorized } from '@/pages/Unauthorized';
import { Business } from '@/pages/Business';
import { Overview } from '@/pages/Overview';
import { Reservations } from '@/pages/Reservations';
import { NewReservation } from '@/pages/NewReservation';
import { Orders } from '@/pages/Orders';
import { NewOrder } from '@/pages/NewOrder';
import { OrderItems } from '@/pages/OrderItems';
import { Items } from '@/pages/Items';

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
    id: RouteId.ORDERS,
    path: '/orders',
    title: 'Orders',
    component: Orders,
    icon: <ShoppingCartOutlined />,
    showInNav: true,
  },
  {
    id: RouteId.NEW_ORDER,
    path: '/orders/new',
    title: 'New Order',
    component: NewOrder,
    showInNav: false,
    parentPage: RouteId.ORDERS,
  },
  {
    id: RouteId.ORDER_ITEMS,
    path: '/orders/:orderId/items',
    title: 'Order Items',
    component: OrderItems,
    showInNav: false,
    parentPage: RouteId.ORDERS,
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
    id: RouteId.ITEMS,
    path: '/items',
    title: 'Items',
    component: Items,
    icon: <ShoppingOutlined />,
    showInNav: true,
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
