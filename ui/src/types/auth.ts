import { BusinessType } from './routes';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessType: BusinessType;
}
