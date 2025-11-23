import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from './user';
import { businessReducer } from './business';

export const rootReducer = combineReducers({
  user: userReducer,
  business: businessReducer,
});
