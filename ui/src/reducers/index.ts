import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './user';
import { businessReducer } from './business';
import { employeeReducer } from './employee';
import { functionReducer } from './function';
import { roleReducer } from './role';
import { reservationReducer } from './reservation';
import { serviceReducer } from './service';
import { itemReducer } from './item';
import { itemOptionReducer } from './itemOption';
import { priceModifierReducer } from './priceModifier';
import { orderReducer } from './order';
import { paymentReducer } from './payment';

export const rootReducer = combineReducers({
  user: userReducer,
  business: businessReducer,
  employee: employeeReducer,
  function: functionReducer,
  role: roleReducer,
  reservation: reservationReducer,
  service: serviceReducer,
  item: itemReducer,
  itemOption: itemOptionReducer,
  priceModifier: priceModifierReducer,
  order: orderReducer,
  payment: paymentReducer,
});
