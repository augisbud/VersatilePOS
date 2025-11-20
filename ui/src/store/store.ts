import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/reducers';
import { createNotificationsMiddleware } from '@/middleware/notifications';

export const createStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(createNotificationsMiddleware()),
  });
