import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './user';
import { businessReducer } from './business';
import { employeeReducer } from './employee';

export const rootReducer = combineReducers({
  user: userReducer,
  business: businessReducer,
  employee: employeeReducer,
});
