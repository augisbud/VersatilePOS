import { createAsyncThunk } from '@reduxjs/toolkit';
import { addOptionToOrderItem, removeOptionFromOrderItem } from '@/api';
import { ModelsCreateItemOptionLinkRequest, ModelsItemOptionLinkDto } from '@/api/types.gen';

export const applyDiscountToOrderItem = createAsyncThunk<
  { orderId: number; orderItemId: number; option: ModelsItemOptionLinkDto },
  { orderId: number; orderItemId: number; data: ModelsCreateItemOptionLinkRequest }
>('orderItemDiscount/applyDiscountToOrderItem', async ({ orderId, orderItemId, data }) => {
  const response = await addOptionToOrderItem({
    path: { orderId, itemId: orderItemId },
    body: data,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from addOptionToOrderItem');
  }

  return { orderId, orderItemId, option: response.data };
});

export const removeDiscountFromOrderItem = createAsyncThunk<
  { orderId: number; orderItemId: number; optionLinkId: number },
  { orderId: number; orderItemId: number; optionLinkId: number }
>('orderItemDiscount/removeDiscountFromOrderItem', async ({ orderId, orderItemId, optionLinkId }) => {
  const response = await removeOptionFromOrderItem({
    path: { orderId, itemId: orderItemId, optionId: optionLinkId },
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return { orderId, orderItemId, optionLinkId };
});


