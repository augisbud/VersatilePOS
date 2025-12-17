import {
  ModelsasCreatePriceModifierRequest,
  ModelsasPriceModifierDto,
  ModelsasUpdatePriceModifierRequest,
} from '@/api/types.gen';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  deletePriceModifier,
  getPriceModifiers,
  getPriceModifierById,
  createPriceModifier,
  updatePriceModifier,
} from '@/api';

export const setPriceModifiersBusinessId = createAction<number>(
  'priceModifier/setPriceModifiersBusinessId'
);

export const fetchPriceModifiers = createAsyncThunk<
  ModelsasPriceModifierDto[],
  number
>('priceModifier/fetchPriceModifiers', async (businessId: number) => {
  const response = await getPriceModifiers({ query: { businessId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return Array.isArray(response.data) ? response.data : [];
});

export const fetchPriceModifierById = createAsyncThunk<
  ModelsasPriceModifierDto,
  { id: number; businessId: number }
>('priceModifier/fetchPriceModifierById', async ({ id, businessId }) => {
  const response = await getPriceModifierById({
    path: { id },
    query: { businessId },
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from getPriceModifierById');
  }

  return response.data;
});

export const addPriceModifier = createAsyncThunk<
  ModelsasPriceModifierDto,
  ModelsasCreatePriceModifierRequest
>(
  'priceModifier/addPriceModifier',
  async (priceModifierData: ModelsasCreatePriceModifierRequest) => {
    const response = await createPriceModifier({ body: priceModifierData });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from createPriceModifier');
    }

    return response.data;
  }
);

export const editPriceModifier = createAsyncThunk<
  ModelsasPriceModifierDto,
  { id: number; businessId: number; data: ModelsasUpdatePriceModifierRequest }
>('priceModifier/editPriceModifier', async ({ id, businessId, data }) => {
  const response = await updatePriceModifier({
    path: { id },
    query: { businessId },
    body: data,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from updatePriceModifier');
  }

  return response.data;
});

export const removePriceModifier = createAsyncThunk<
  number,
  { id: number; businessId: number }
>('priceModifier/removePriceModifier', async ({ id, businessId }) => {
  const response = await deletePriceModifier({
    path: { id },
    query: { businessId },
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return id;
});
