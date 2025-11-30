import { ModelsFunctionDto } from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAllFunctions } from '@/api';

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
