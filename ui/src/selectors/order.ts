import { State } from '@/types/redux';
import {
  ModelsItemOptionLinkDto,
  ModelsOrderDto,
  ModelsOrderItemDto,
} from '@/api/types.gen';

export const getOrders = (state: State): ModelsOrderDto[] => state.order.orders;

export const getSelectedOrder = (state: State) => state.order.selectedOrder;

export const getOrdersLoading = (state: State) => state.order.loading;

export const getOrdersError = (state: State) => state.order.error;

export const getOrdersBusinessId = (state: State) => state.order.selectedBusinessId;

export const getOrderItems = (state: State): ModelsOrderItemDto[] =>
  state.order.orderItems;

export const getOrderItemOptionsMap = (
  state: State
): Record<number, ModelsItemOptionLinkDto[]> => state.order.itemOptionsByOrderItem;

export const getOrderById = (orders: ModelsOrderDto[], id: number) =>
  orders.find((order) => order.id === id);

export const getOrderItemById = (orderItems: ModelsOrderItemDto[], id: number) =>
  orderItems.find((item) => item.id === id);

export const getOptionsForOrderItem = (
  optionsByItem: Record<number, ModelsItemOptionLinkDto[]>,
  itemId: number
) => optionsByItem[itemId] ?? [];
