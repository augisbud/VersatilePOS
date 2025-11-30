import { createAccount, login, logout } from '@/actions/user';
import { createReducer } from '@reduxjs/toolkit';
import { setAuthToken } from '@/utils/apiClient';
import {
  clearStateFromLocalStorage,
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from '@/utils/auth';
import { ModelsAccountRoleLinkDto } from '@/api/types.gen';

export interface UserState {
  id?: number;
  name?: string;
  username?: string;
  token?: string;
  businessId?: number;
  roles?: ModelsAccountRoleLinkDto[];
}

const initialState: UserState = loadStateFromLocalStorage();

export const userReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(createAccount.fulfilled, (state, { payload }) => {
      state.id = payload?.id;
      state.name = payload?.name;
      state.username = payload?.username;
      state.businessId = payload?.businessId;

      saveStateToLocalStorage(state);
    })
    .addCase(login.fulfilled, (state, { payload }) => {
      state.token = payload?.token;
      state.id = payload?.id;
      state.name = payload?.name;
      state.username = payload?.username;
      state.businessId = payload?.businessId;
      state.roles = payload?.roles;

      saveStateToLocalStorage(state);
    })
    .addCase(logout, (state) => {
      state.id = undefined;
      state.name = undefined;
      state.username = undefined;
      state.token = undefined;
      state.businessId = undefined;

      setAuthToken(undefined);
      clearStateFromLocalStorage();
    });
});
