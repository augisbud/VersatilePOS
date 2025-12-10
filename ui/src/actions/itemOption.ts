import {
  ModelsCreateItemOptionRequest,
  ModelsItemOptionDto,
  ModelsUpdateItemOptionRequest,
} from '@/api/types.gen';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  deleteItemOptionById,
  getItemOption,
  getItemOptionById,
  postItemOption,
  putItemOptionById,
} from '@/api';

export const setItemOptionsBusinessId = createAction<number>(
  'itemOption/setItemOptionsBusinessId'
);

export const fetchItemOptions = createAsyncThunk<ModelsItemOptionDto[], number>(
  'itemOption/fetchItemOptions',
  async (businessId: number) => {
    const response = await getItemOption({ query: { businessId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchItemOptionById = createAsyncThunk<
  ModelsItemOptionDto,
  number
>('itemOption/fetchItemOptionById', async (itemOptionId: number) => {
  const response = await getItemOptionById({ path: { id: itemOptionId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from getItemOptionById');
  }

  return response.data;
});

export const addItemOption = createAsyncThunk<
  ModelsItemOptionDto,
  ModelsCreateItemOptionRequest
>(
  'itemOption/addItemOption',
  async (itemOptionData: ModelsCreateItemOptionRequest) => {
    const response = await postItemOption({ body: itemOptionData });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from postItemOption');
    }

    return response.data;
  }
);

export const editItemOption = createAsyncThunk<
  ModelsItemOptionDto,
  { id: number; data: ModelsUpdateItemOptionRequest }
>('itemOption/editItemOption', async ({ id, data }) => {
  const response = await putItemOptionById({ path: { id }, body: data });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from putItemOptionById');
  }

  return response.data;
});

export const removeItemOption = createAsyncThunk<number, number>(
  'itemOption/removeItemOption',
  async (itemOptionId: number) => {
    const response = await deleteItemOptionById({ path: { id: itemOptionId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return itemOptionId;
  }
);
