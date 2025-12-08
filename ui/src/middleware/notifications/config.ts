import { createAccount, login } from '@/actions/user';
import {
  assignEmployeeToService,
  unassignEmployeeFromService,
} from '@/actions/service';
import { addReservation } from '@/actions/reservation';
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
  [assignEmployeeToService.fulfilled.type]: () => ({
    type: 'success',
    message: 'Employee assigned successfully',
  }),
  [assignEmployeeToService.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message ?? 'Failed to assign employee',
  }),
  [unassignEmployeeFromService.fulfilled.type]: () => ({
    type: 'success',
    message: 'Employee removed successfully',
  }),
  [unassignEmployeeFromService.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message ?? 'Failed to remove employee',
  }),
  [addReservation.fulfilled.type]: () => ({
    type: 'success',
    message: 'Reservation created successfully',
  }),
  [addReservation.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message ?? 'Failed to create reservation',
  }),
} as NotificationConfigs;
