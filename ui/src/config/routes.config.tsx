import {
  CalendarOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { ScreenConfig, RouteId } from '@/types/routes';
import { Unauthorized } from '@/pages/Unauthorized';
import { Business } from '@/pages/Business';
import { Reservations } from '@/pages/Reservations';
import { NewReservation } from '@/pages/NewReservation';
import { Orders } from '@/pages/Orders';
import { NewOrder } from '@/pages/NewOrder';
import { Items } from '@/pages/Items';

export const routesConfig: ScreenConfig[] = [
  {
    id: RouteId.BUSINESS,
    path: '/',
    title: 'My Businesses',
    component: Business,
    icon: <ShopOutlined />,
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
    id: RouteId.ITEMS,
    path: '/items',
    title: 'Items',
    component: Items,
    icon: <ShoppingOutlined />,
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
    id: RouteId.EDIT_ORDER,
    path: '/orders/:orderId/edit',
    title: 'Edit Order',
    component: NewOrder,
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
];
