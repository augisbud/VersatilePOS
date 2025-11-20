import { EntitiesAccount } from '@/api';
import { BusinessType } from './routes';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
}

export interface User extends EntitiesAccount {
  role: UserRole;
  businessType: BusinessType;
}
