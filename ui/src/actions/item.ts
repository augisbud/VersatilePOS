import {
  ModelsCreateItemRequest,
  ModelsItemDto,
  ModelsUpdateItemRequest,
} from '@/api/types.gen';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { deleteItemById, getItem, getItemById, postItem, putItemById } from '@/api';

export const setItemsBusinessId = createAction<number>('item/setItemsBusinessId');

export const fetchItems = createAsyncThunk<ModelsItemDto[], number>(
  'item/fetchItems',
  async (businessId: number) => {
    const response = await getItem({ query: { businessId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchItemById = createAsyncThunk<ModelsItemDto, number>(
  'item/fetchItemById',
  async (itemId: number) => {
    const response = await getItemById({ path: { id: itemId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from getItemById');
    }

    return response.data;
  }
);

export const addItem = createAsyncThunk<ModelsItemDto, ModelsCreateItemRequest>(
  'item/addItem',
  async (itemData: ModelsCreateItemRequest) => {
    const response = await postItem({ body: itemData });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from postItem');
    }

    return response.data;
  }
);

export const editItem = createAsyncThunk<
  ModelsItemDto,
  { id: number; data: ModelsUpdateItemRequest }
>('item/editItem', async ({ id, data }) => {
  const response = await putItemById({ path: { id }, body: data });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from putItemById');
  }

  return response.data;
});

export const removeItem = createAsyncThunk<number, number>(
  'item/removeItem',
  async (itemId: number) => {
    const response = await deleteItemById({ path: { id: itemId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return itemId;
  }
);
