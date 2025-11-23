import {
  ModelsAccountDto,
  ModelsCreateAccountRequest,
  ModelsLoginRequest,
} from '@/api/types.gen';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { createAccount as createAccountApi, getMyAccount, loginAccount } from '@/api';

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

export const login = createAsyncThunk<
  ModelsAccountDto & { token: string },
  ModelsLoginRequest
>(
  'user/login',
  async (account: ModelsLoginRequest) => {
    const loginResponse = await loginAccount({ body: account });

    if (loginResponse.error) {
      console.log('loginResponse.error', loginResponse.error.error);
      throw new Error(loginResponse.error.error);
    }

    const user = await getMyAccount();

    if (!user.data) {
      throw new Error('User data is missing');
    }

    const token = loginResponse.data.token;
    const userData = user.data as ModelsAccountDto;

    return {
      ...userData,
      token,
    };
  }
);

export const logout = createAction('user/logout');
