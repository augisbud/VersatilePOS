import { ModelsAccountDto } from '@/api/types.gen';
import { BusinessType } from './routes';

export interface User extends ModelsAccountDto {
  businessType: BusinessType;
}
