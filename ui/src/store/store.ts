import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/reducers';

export const createStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
