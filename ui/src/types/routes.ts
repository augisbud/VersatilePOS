import { ReactNode } from 'react';
import { UserRole } from './auth';

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
  roles: UserRole[];
  icon?: ReactNode;
  showInNav?: boolean;
  businessType?: BusinessType;
}
