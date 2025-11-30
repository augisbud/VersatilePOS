import { ModelsFunctionDto } from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAllFunctions, getFunctionsForRole } from '@/api';

export const fetchAllFunctions = createAsyncThunk<ModelsFunctionDto[]>(
  'function/fetchAllFunctions',
  async () => {
    const response = await getAllFunctions();

    if (response.error) {
      throw new Error(response.error.error);
    }

    return response.data ?? [];
  }
);

export const fetchFunctionsForRole = createAsyncThunk<
  ModelsFunctionDto[],
  number
>('function/fetchFunctionsForRole', async (roleId: number) => {
  const response = await getFunctionsForRole({ path: { id: roleId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return response.data ?? [];
});
