import {
  addOrder,
  addOrderItem,
  editOrder,
  editOrderItem,
  removeOrderItem,
} from '@/actions/order';
import { addReservation } from '@/actions/reservation';
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
  [addReservation.fulfilled.type]: () => ({
    type: 'success',
    message: 'Reservation created successfully',
  }),
  [addReservation.rejected.type]: (action: RejectetAction) => ({
    type: 'error',
    message: action.error.message,
  }),
} as NotificationConfigs;
