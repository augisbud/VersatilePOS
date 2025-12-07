import {
  ModelsApplyPriceModifierRequest,
  ModelsCreateItemOptionLinkRequest,
  ModelsCreateOrderItemRequest,
  ModelsCreateOrderRequest,
  ModelsItemOptionLinkDto,
  ModelsOrderDto,
  ModelsOrderItemDto,
  ModelsUpdateOrderItemRequest,
  ModelsUpdateOrderRequest,
} from '@/api/types.gen';
import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addItemToOrder,
  addOptionToOrderItem,
  applyPriceModifierToOrder,
  createOrder,
  getItemOptionsInOrder,
  getOrderById,
  getOrderItems,
  getOrders,
  linkPaymentToOrder,
  removeItemFromOrder,
  removeOptionFromOrderItem,
  updateOrder,
  updateOrderItem,
} from '@/api';

export const setOrdersBusinessId = createAction<number>('order/setOrdersBusinessId');

export const fetchOrders = createAsyncThunk<ModelsOrderDto[], number>(
  'order/fetchOrders',
  async (businessId: number) => {
    const response = await getOrders({ query: { businessId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchOrderById = createAsyncThunk<ModelsOrderDto, number>(
  'order/fetchOrderById',
  async (orderId: number) => {
    const response = await getOrderById({ path: { id: orderId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from getOrderById');
    }

    return response.data;
  }
);

export const addOrder = createAsyncThunk<ModelsOrderDto, ModelsCreateOrderRequest>(
  'order/addOrder',
  async (orderData: ModelsCreateOrderRequest) => {
    const response = await createOrder({ body: orderData });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from createOrder');
    }

    return response.data;
  }
);

export const editOrder = createAsyncThunk<
  ModelsOrderDto,
  { id: number; data: ModelsUpdateOrderRequest }
>('order/editOrder', async ({ id, data }) => {
  const response = await updateOrder({ path: { id }, body: data });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from updateOrder');
  }

  return response.data;
});

export const fetchOrderItems = createAsyncThunk<ModelsOrderItemDto[], number>(
  'order/fetchOrderItems',
  async (orderId: number) => {
    const response = await getOrderItems({ path: { id: orderId } });

    if (response.error) {
      throw new Error(response.error.error);
    }

    return Array.isArray(response.data) ? response.data : [];
  }
);

export const addOrderItem = createAsyncThunk<
  ModelsOrderItemDto,
  { orderId: number; data: ModelsCreateOrderItemRequest }
>('order/addOrderItem', async ({ orderId, data }) => {
  const response = await addItemToOrder({ path: { id: orderId }, body: data });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from addItemToOrder');
  }

  return response.data;
});

export const removeOrderItem = createAsyncThunk<
  { orderId: number; itemId: number },
  { orderId: number; itemId: number }
>('order/removeOrderItem', async ({ orderId, itemId }) => {
  const response = await removeItemFromOrder({ path: { orderId, itemId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return { orderId, itemId };
});

export const editOrderItem = createAsyncThunk<
  ModelsOrderItemDto,
  { orderId: number; itemId: number; data: ModelsUpdateOrderItemRequest }
>('order/editOrderItem', async ({ orderId, itemId, data }) => {
  const response = await updateOrderItem({
    path: { orderId, itemId },
    body: data,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from updateOrderItem');
  }

  return response.data;
});

export const fetchOrderItemOptions = createAsyncThunk<
  { orderId: number; itemId: number; options: ModelsItemOptionLinkDto[] },
  { orderId: number; itemId: number }
>('order/fetchOrderItemOptions', async ({ orderId, itemId }) => {
  const response = await getItemOptionsInOrder({ path: { orderId, itemId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  const options = Array.isArray(response.data) ? response.data : [];

  return { orderId, itemId, options };
});

export const addOrderItemOption = createAsyncThunk<
  { orderId: number; itemId: number; option: ModelsItemOptionLinkDto },
  { orderId: number; itemId: number; data: ModelsCreateItemOptionLinkRequest }
>('order/addOrderItemOption', async ({ orderId, itemId, data }) => {
  const response = await addOptionToOrderItem({
    path: { orderId, itemId },
    body: data,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from addOptionToOrderItem');
  }

  return { orderId, itemId, option: response.data };
});

export const removeOrderItemOption = createAsyncThunk<
  { orderId: number; itemId: number; optionId: number },
  { orderId: number; itemId: number; optionId: number }
>('order/removeOrderItemOption', async ({ orderId, itemId, optionId }) => {
  const response = await removeOptionFromOrderItem({
    path: { orderId, itemId, optionId },
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return { orderId, itemId, optionId };
});

export const linkPayment = createAsyncThunk<
  { orderId: number; paymentId: number },
  { orderId: number; paymentId: number }
>('order/linkPayment', async ({ orderId, paymentId }) => {
  const response = await linkPaymentToOrder({ path: { orderId, paymentId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return { orderId, paymentId };
});

export const applyPriceModifier = createAsyncThunk<
  { orderId: number; orderItemId: number; priceModifierId: number },
  { orderId: number; data: ModelsApplyPriceModifierRequest }
>('order/applyPriceModifier', async ({ orderId, data }) => {
  const response = await applyPriceModifierToOrder({
    path: { orderId },
    body: data,
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return {
    orderId,
    orderItemId: data.orderItemId,
    priceModifierId: data.priceModifierId,
  };
});
