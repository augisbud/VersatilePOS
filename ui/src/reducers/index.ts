import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './user';
import { businessReducer } from './business';
import { employeeReducer } from './employee';
import { functionReducer } from './function';
import { roleReducer } from './role';
import { reservationReducer } from './reservation';

export const rootReducer = combineReducers({
  user: userReducer,
  business: businessReducer,
  employee: employeeReducer,
  function: functionReducer,
  role: roleReducer,
  reservation: reservationReducer,
});
