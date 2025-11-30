import { ReactNode } from 'react';

export enum RouteId {
  LOGIN = 'login',
  REGISTER = 'register',
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  BUSINESS = 'business',
  OVERVIEW = 'overview',
}

export enum BusinessType {
  RESTAURANT = 'restaurant',
  BEAUTY_SALON = 'beauty_salon',
}

export interface ScreenConfig {
  id: RouteId;
  path: string;
  title: string;
  component: React.ComponentType;
  roles: string[];
  icon?: ReactNode;
  showInNav?: boolean;
  businessType?: BusinessType;
}
