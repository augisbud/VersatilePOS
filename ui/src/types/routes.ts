import { ReactNode } from 'react';

export enum RouteId {
  LOGIN = 'login',
  REGISTER = 'register',
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  BUSINESS = 'business',
  ITEMS = 'items',
  OVERVIEW = 'overview',
  ORDERS = 'orders',
  NEW_ORDER = 'new_order',
  EDIT_ORDER = 'edit_order',
  ORDER_ITEMS = 'order_items',
  RESERVATIONS = 'reservations',
  NEW_RESERVATION = 'new_reservation',
}

export interface ScreenConfig {
  id: RouteId;
  path: string;
  title: string;
  component: React.ComponentType;
  icon?: ReactNode;
  showInNav?: boolean;
  parentPage?: RouteId;
  fullScreen?: boolean;
}
