import { createReducer } from '@reduxjs/toolkit';
import {
  addOrder,
  addOrderItem,
  addOrderItemOption,
  applyPriceModifier,
  editOrder,
  editOrderItem,
  fetchOrderById,
  fetchOrderItemOptions,
  fetchOrderItems,
  fetchOrderItemsForAllOrders,
  fetchOrders,
  linkPayment,
  removeOrderItem,
  removeOrderItemOption,
  setOrdersBusinessId,
} from '@/actions/order';
import {
  ModelsItemOptionLinkDto,
  ModelsOrderDto,
  ModelsOrderItemDto,
} from '@/api/types.gen';

export interface OrderState {
  orders: ModelsOrderDto[];
  orderItems: ModelsOrderItemDto[];
  orderItemsByOrderId: Record<number, ModelsOrderItemDto[]>;
  itemOptionsByOrderItem: Record<number, ModelsItemOptionLinkDto[]>;
  allItemOptionLinks: Record<number, ModelsItemOptionLinkDto[]>; // for order card totals
  selectedOrder?: ModelsOrderDto;
  selectedBusinessId?: number;
  loading: boolean;
  error?: string;
}

const initialState: OrderState = {
  orders: [],
  orderItems: [],
  orderItemsByOrderId: {},
  itemOptionsByOrderItem: {},
  allItemOptionLinks: {},
  selectedOrder: undefined,
  selectedBusinessId: undefined,
  loading: false,
};

export const orderReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setOrdersBusinessId, (state, { payload }) => {
      state.selectedBusinessId = payload;
      state.orders = [];
      state.orderItems = [];
      state.orderItemsByOrderId = {};
      state.itemOptionsByOrderItem = {};
      state.allItemOptionLinks = {};
      state.selectedOrder = undefined;
      state.error = undefined;
    })
    // Fetch orders
    .addCase(fetchOrders.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchOrders.fulfilled, (state, { payload }) => {
      state.orders = payload;
      state.loading = false;
    })
    .addCase(fetchOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch order by ID
    .addCase(fetchOrderById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchOrderById.fulfilled, (state, { payload }) => {
      state.selectedOrder = payload;
      state.loading = false;
    })
    .addCase(fetchOrderById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add order
    .addCase(addOrder.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addOrder.fulfilled, (state, { payload }) => {
      state.orders.push(payload);
      state.selectedOrder = payload;
      state.loading = false;
    })
    .addCase(addOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Edit order
    .addCase(editOrder.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(editOrder.fulfilled, (state, { payload }) => {
      state.orders = state.orders.map((order) =>
        order.id === payload.id ? payload : order
      );
      state.selectedOrder =
        state.selectedOrder?.id === payload.id ? payload : state.selectedOrder;
      state.loading = false;
    })
    .addCase(editOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch order items
    .addCase(fetchOrderItems.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchOrderItems.fulfilled, (state, { payload }) => {
      state.orderItems = payload;
      const currentOrderItemIds = new Set(payload.map((item) => item.id));
      for (const itemId of Object.keys(state.itemOptionsByOrderItem)) {
        if (!currentOrderItemIds.has(Number(itemId))) {
          delete state.itemOptionsByOrderItem[Number(itemId)];
        }
      }
      state.loading = false;
    })
    .addCase(fetchOrderItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add order item
    .addCase(addOrderItem.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addOrderItem.fulfilled, (state, { payload }) => {
      state.orderItems.push(payload);
      state.loading = false;
    })
    .addCase(addOrderItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Edit order item
    .addCase(editOrderItem.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(editOrderItem.fulfilled, (state, { payload }) => {
      state.orderItems = state.orderItems.map((item) =>
        item.id === payload.id ? payload : item
      );
      state.loading = false;
    })
    .addCase(editOrderItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Remove order item
    .addCase(removeOrderItem.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(removeOrderItem.fulfilled, (state, { payload }) => {
      state.orderItems = state.orderItems.filter(
        (item) => item.id !== payload.itemId
      );
      delete state.itemOptionsByOrderItem[payload.itemId];
      state.loading = false;
    })
    .addCase(removeOrderItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch order item options
    .addCase(fetchOrderItemOptions.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchOrderItemOptions.fulfilled, (state, { payload }) => {
      state.itemOptionsByOrderItem[payload.itemId] = payload.options;
      state.loading = false;
    })
    .addCase(fetchOrderItemOptions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add order item option
    .addCase(addOrderItemOption.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addOrderItemOption.fulfilled, (state, { payload }) => {
      const existingOptions =
        state.itemOptionsByOrderItem[payload.itemId] ?? [];
      state.itemOptionsByOrderItem[payload.itemId] = [
        ...existingOptions,
        payload.option,
      ];
      state.loading = false;
    })
    .addCase(addOrderItemOption.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Remove order item option
    .addCase(removeOrderItemOption.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(removeOrderItemOption.fulfilled, (state, { payload }) => {
      state.itemOptionsByOrderItem[payload.itemId] = (
        state.itemOptionsByOrderItem[payload.itemId] ?? []
      ).filter((option) => option.id !== payload.optionId);
      state.loading = false;
    })
    .addCase(removeOrderItemOption.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Link payment
    .addCase(linkPayment.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(linkPayment.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(linkPayment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Apply price modifier
    .addCase(applyPriceModifier.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(applyPriceModifier.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(applyPriceModifier.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch order items for all orders
    .addCase(fetchOrderItemsForAllOrders.fulfilled, (state, { payload }) => {
      state.orderItemsByOrderId = payload.orderItems;
      state.allItemOptionLinks = payload.itemOptionLinks;
    });
});
