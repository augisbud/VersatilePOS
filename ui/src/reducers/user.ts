import { createAccount } from '@/actions/user';
import { createReducer } from '@reduxjs/toolkit';

interface UserState {
  identAccount?: number;
  name?: string;
  username?: string;
}

const initialState: UserState = {};

export const userReducer = createReducer(initialState, (builder) => {
  builder.addCase(createAccount.fulfilled, (state, action) => {
    state.identAccount = action.payload?.identAccount;
    state.name = action.payload?.name;
    state.username = action.payload?.username;
  });
});
