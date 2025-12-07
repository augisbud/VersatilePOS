import { createReducer } from '@reduxjs/toolkit';
import {
  addItem,
  editItem,
  fetchItemById,
  fetchItems,
  removeItem,
  setItemsBusinessId,
} from '@/actions/item';
import { ModelsItemDto } from '@/api/types.gen';

export interface ItemState {
  items: ModelsItemDto[];
  selectedItem?: ModelsItemDto;
  selectedBusinessId?: number;
  loading: boolean;
  error?: string;
}

const initialState: ItemState = {
  items: [],
  selectedItem: undefined,
  selectedBusinessId: undefined,
  loading: false,
};

export const itemReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setItemsBusinessId, (state, { payload }) => {
      state.selectedBusinessId = payload;
      state.items = [];
      state.selectedItem = undefined;
      state.error = undefined;
    })
    // Fetch items
    .addCase(fetchItems.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchItems.fulfilled, (state, { payload }) => {
      state.items = payload;
      state.loading = false;
    })
    .addCase(fetchItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch item by ID
    .addCase(fetchItemById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchItemById.fulfilled, (state, { payload }) => {
      state.selectedItem = payload;
      state.loading = false;
    })
    .addCase(fetchItemById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add item
    .addCase(addItem.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addItem.fulfilled, (state, { payload }) => {
      state.items.push(payload);
      state.loading = false;
    })
    .addCase(addItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Edit item
    .addCase(editItem.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(editItem.fulfilled, (state, { payload }) => {
      state.items = state.items.map((item) =>
        item.id === payload.id ? payload : item
      );
      state.selectedItem =
        state.selectedItem?.id === payload.id ? payload : state.selectedItem;
      state.loading = false;
    })
    .addCase(editItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Remove item
    .addCase(removeItem.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(removeItem.fulfilled, (state, { payload }) => {
      state.items = state.items.filter((item) => item.id !== payload);
      if (state.selectedItem?.id === payload) {
        state.selectedItem = undefined;
      }
      state.loading = false;
    })
    .addCase(removeItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
