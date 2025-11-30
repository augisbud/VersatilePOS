import {
  ModelsAccountDto,
  ModelsCreateAccountRequest,
  ModelsLoginRequest,
} from '@/api/types.gen';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createAccount as createAccountApi,
  getMyAccount,
  loginAccount,
} from '@/api';
import { setAuthToken } from '@/utils/apiClient';

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
>('user/login', async (account: ModelsLoginRequest) => {
  const loginResponse = await loginAccount({ body: account });

  if (loginResponse.error) {
    throw new Error(loginResponse.error.error);
  }
  const token = loginResponse.data.token;
  setAuthToken(token);

  const user = await getMyAccount();

  if (!user.data) {
    throw new Error('User data is missing');
  }

  const userData = user.data;

  return {
    ...userData,
    token,
  };
});

export const fetchMyAccount = createAsyncThunk<ModelsAccountDto, void>(
  'user/fetchMyAccount',
  async () => {
    const response = await getMyAccount();

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('User data is missing');
    }

    return response.data;
  }
);

export const logout = createAction('user/logout');
