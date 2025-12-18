import {
  addOrder,
  addOrderItem,
  editOrder,
  editOrderItem,
  removeOrderItem,
} from '@/actions/order';
import { createAccount, login } from '@/actions/user';
import {
  assignEmployeeToService,
  unassignEmployeeFromService,
} from '@/actions/service';
import { addReservation } from '@/actions/reservation';
import { NotificationConfigs, RejectetAction } from './interfaces';

export const NOTIFICATIONS_CONFIG = {
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
  [addOrder.fulfilled.type]: () => ({
    type: 'success',
    message: 'Order created',
  }),
  [addOrder.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message,
  }),
  [editOrder.fulfilled.type]: () => ({
    type: 'success',
    message: 'Order updated',
  }),
  [editOrder.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message,
  }),
  [editOrderItem.fulfilled.type]: () => ({
    type: 'success',
    message: 'Order item updated',
  }),
  [editOrderItem.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message,
  }),
  [addOrderItem.fulfilled.type]: () => ({
    type: 'success',
    message: 'Item added to order',
  }),
  [addOrderItem.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message,
  }),
  [removeOrderItem.fulfilled.type]: () => ({
    type: 'success',
    message: 'Item removed from order',
  }),
  [removeOrderItem.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message,
  }),
} as NotificationConfigs;
