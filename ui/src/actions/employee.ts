import { ModelsAccountDto, ModelsCreateAccountRequest } from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAccounts, deleteAccountById, createAccount } from '@/api';

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

export const createEmployee = createAsyncThunk<
  ModelsAccountDto,
  ModelsCreateAccountRequest
>(
  'employee/createEmployee',
  async (employeeData: ModelsCreateAccountRequest) => {
    const response = await createAccount({ body: employeeData });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from createAccount');
    }

    return response.data;
  }
);
