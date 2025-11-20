import { createAccount, login } from '@/actions/user';
import { NotificationConfigs, RejectetAction } from './interfaces';

export const NOTIFICATIONS_CONFIG = {
  [createAccount.fulfilled.type]: () => ({
    type: 'success',
    message: 'Account created successfully',
  }),
  [createAccount.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message,
  }),
  [login.fulfilled.type]: () => ({
    type: 'success',
    message: 'Login successful',
  }),
  [login.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message,
  }),
} as NotificationConfigs;
