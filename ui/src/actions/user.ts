import {
  ModelsCreateAccountRequest,
  ModelsLoginRequest,
} from '@/api/types.gen';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { createAccount as createAccountApi, loginAccount } from '@/api';

export const createAccount = createAsyncThunk(
  'user/createAccount',
  async (account: ModelsCreateAccountRequest) => {
    const response = await createAccountApi({ body: account });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return response.data;
  }
);

export const login = createAsyncThunk(
  'user/login',
  async (account: ModelsLoginRequest) => {
    const response = await loginAccount({ body: account });

    if (response.error) {
      console.log('response.error', response.error.error);
      throw new Error(response.error.error);
    }

    return response.data;
  }
);

export const logout = createAction('user/logout');
