import { ModelsAccountDto } from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAccounts, deleteAccountById } from '@/api';

export const fetchEmployees = createAsyncThunk<ModelsAccountDto[], number>(
  'employee/fetchEmployees',
  async (businessId: number) => {
    const response = await getAccounts({ path: { businessId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return response.data ?? [];
  }
);

export const deleteEmployee = createAsyncThunk<number, number>(
  'employee/deleteEmployee',
  async (accountId: number) => {
    const response = await deleteAccountById({ path: { id: accountId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return accountId;
  }
);
