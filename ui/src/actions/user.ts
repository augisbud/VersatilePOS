import { ModelsCreateAccountRequest } from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { createAccount as createAccountApi } from '@/api';

export const createAccount = createAsyncThunk(
  'user/createAccount',
  async (account: ModelsCreateAccountRequest) => {
    const response = await createAccountApi({ body: account });

    return response.data;
  }
);
