import { createAccount, login, logout } from '@/actions/user';
import { createReducer } from '@reduxjs/toolkit';
import { setAuthToken } from '@/utils/apiClient';
import {
  clearStateFromLocalStorage,
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from '@/utils/auth';

export interface UserState {
  id?: number;
  name?: string;
  username?: string;
  token?: string;
}

const initialState: UserState = loadStateFromLocalStorage();

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(createAccount.fulfilled, (state, { payload }) => {
      state.id = payload?.id;
      state.name = payload?.name;
      state.username = payload?.username;

      saveStateToLocalStorage(state);
    })
    .addCase(login.fulfilled, (state, { payload }) => {
      state.token = payload?.token;
      state.id = payload?.id;
      state.name = payload?.name;
      state.username = payload?.username;

      setAuthToken(state.token);
      saveStateToLocalStorage(state);
    })
    .addCase(logout, (state) => {
      state.id = undefined;
      state.name = undefined;
      state.username = undefined;
      state.token = undefined;

      setAuthToken(undefined);
      clearStateFromLocalStorage();
    });
});
