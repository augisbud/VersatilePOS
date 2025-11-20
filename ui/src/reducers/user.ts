import { createAccount, login, logout } from '@/actions/user';
import { createReducer } from '@reduxjs/toolkit';
import { setAuthToken } from '@/utils/apiClient';
import {
  clearStateFromLocalStorage,
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from '@/utils/auth';

export interface UserState {
  identAccount?: number;
  name?: string;
  username?: string;
  token?: string;
}

const initialState: UserState = loadStateFromLocalStorage();

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(createAccount.fulfilled, (state, action) => {
      state.identAccount = action.payload?.identAccount;
      state.name = action.payload?.name;
      state.username = action.payload?.username;

      saveStateToLocalStorage(state);
    })
    .addCase(login.fulfilled, (state, action) => {
      state.token = action.payload?.token;
      state.username = action.meta.arg.username;

      setAuthToken(state.token);
      saveStateToLocalStorage(state);
    })
    .addCase(logout, (state) => {
      state.identAccount = undefined;
      state.name = undefined;
      state.username = undefined;
      state.token = undefined;

      setAuthToken(undefined);
      clearStateFromLocalStorage();
    });
});
