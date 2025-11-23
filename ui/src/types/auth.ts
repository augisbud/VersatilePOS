import { ModelsAccountDto } from '@/api/types.gen';
import { BusinessType } from './routes';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
}

export interface User extends ModelsAccountDto {
  role: UserRole;
  businessType: BusinessType;
}
