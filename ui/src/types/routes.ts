import { ReactNode } from 'react';

export enum RouteId {
  LOGIN = 'login',
  REGISTER = 'register',
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  BUSINESS = 'business',
  OVERVIEW = 'overview',
}

export interface ScreenConfig {
  id: RouteId;
  path: string;
  title: string;
  component: React.ComponentType;
  icon?: ReactNode;
  showInNav?: boolean;
}
