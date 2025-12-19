import {
  ModelsGiftCardDto,
  ModelsCreateGiftCardRequest,
  ModelsCheckBalanceRequest,
} from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getGiftCards,
  getGiftCardById,
  createGiftCard,
  checkGiftCardBalance,
  deactivateGiftCard,
} from '@/api';

export const fetchGiftCards = createAsyncThunk<ModelsGiftCardDto[], number>(
  'giftCard/fetchGiftCards',
  async (businessId) => {
    const response = await getGiftCards({ query: { businessId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchGiftCardById = createAsyncThunk<ModelsGiftCardDto, number>(
  'giftCard/fetchGiftCardById',
  async (giftCardId: number) => {
    const response = await getGiftCardById({ path: { id: giftCardId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from getGiftCardById');
    }

    return response.data;
  }
);

export const addGiftCard = createAsyncThunk<
  ModelsGiftCardDto,
  ModelsCreateGiftCardRequest
>('giftCard/addGiftCard', async (giftCardData: ModelsCreateGiftCardRequest) => {
  const response = await createGiftCard({ body: giftCardData });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from createGiftCard');
  }

  return response.data;
});

export const checkBalance = createAsyncThunk<
  ModelsGiftCardDto,
  ModelsCheckBalanceRequest
>(
  'giftCard/checkBalance',
  async (checkBalanceData: ModelsCheckBalanceRequest) => {
    const response = await checkGiftCardBalance({ body: checkBalanceData });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from checkGiftCardBalance');
    }

    return response.data;
  }
);

export const deactivateCard = createAsyncThunk<ModelsGiftCardDto, number>(
  'giftCard/deactivateCard',
  async (giftCardId: number) => {
    const response = await deactivateGiftCard({ path: { id: giftCardId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from deactivateGiftCard');
    }

    return response.data;
  }
);
