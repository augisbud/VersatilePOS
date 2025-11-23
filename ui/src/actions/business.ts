import {
  ModelsBusinessDto,
  ModelsCreateBusinessRequest,
} from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createBusiness as createBusinessApi,
  getBusinessById,
  getBusinesses,
} from '@/api';

export const createBusiness = createAsyncThunk(
  'business/createBusiness',
  async (businessData: ModelsCreateBusinessRequest) => {
    const response = await createBusinessApi({ body: businessData });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return response.data;
  }
);

export const fetchBusinessById = createAsyncThunk(
  'business/fetchBusinessById',
  async (businessId: number) => {
    const response = await getBusinessById({ path: { id: businessId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return response.data;
  }
);

export const fetchBusinesses = createAsyncThunk<ModelsBusinessDto[], void>(
  'business/fetchBusinesses',
  async () => {
    const response = await getBusinesses();

    if (response.error) {
      throw new Error(response.error.error);
    }

    return response.data ?? [];
  }
);
