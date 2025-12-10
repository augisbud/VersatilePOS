import { createReducer } from '@reduxjs/toolkit';
import {
  addItemOption,
  editItemOption,
  fetchItemOptionById,
  fetchItemOptions,
  removeItemOption,
  setItemOptionsBusinessId,
} from '@/actions/itemOption';
import { ModelsItemOptionDto } from '@/api/types.gen';

export interface ItemOptionState {
  itemOptions: ModelsItemOptionDto[];
  selectedItemOption?: ModelsItemOptionDto;
  selectedBusinessId?: number;
  loading: boolean;
  error?: string;
}

const initialState: ItemOptionState = {
  itemOptions: [],
  selectedItemOption: undefined,
  selectedBusinessId: undefined,
  loading: false,
};

export const itemOptionReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setItemOptionsBusinessId, (state, { payload }) => {
      state.selectedBusinessId = payload;
      state.itemOptions = [];
      state.selectedItemOption = undefined;
      state.error = undefined;
    })
    // Fetch item options
    .addCase(fetchItemOptions.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchItemOptions.fulfilled, (state, { payload }) => {
      state.itemOptions = payload;
      state.loading = false;
    })
    .addCase(fetchItemOptions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch item option by ID
    .addCase(fetchItemOptionById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchItemOptionById.fulfilled, (state, { payload }) => {
      state.selectedItemOption = payload;
      state.loading = false;
    })
    .addCase(fetchItemOptionById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add item option
    .addCase(addItemOption.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addItemOption.fulfilled, (state, { payload }) => {
      state.itemOptions.push(payload);
      state.loading = false;
    })
    .addCase(addItemOption.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Edit item option
    .addCase(editItemOption.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(editItemOption.fulfilled, (state, { payload }) => {
      state.itemOptions = state.itemOptions.map((itemOption) =>
        itemOption.id === payload.id ? payload : itemOption
      );
      state.selectedItemOption =
        state.selectedItemOption?.id === payload.id
          ? payload
          : state.selectedItemOption;
      state.loading = false;
    })
    .addCase(editItemOption.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Remove item option
    .addCase(removeItemOption.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(removeItemOption.fulfilled, (state, { payload }) => {
      state.itemOptions = state.itemOptions.filter(
        (itemOption) => itemOption.id !== payload
      );
      if (state.selectedItemOption?.id === payload) {
        state.selectedItemOption = undefined;
      }
      state.loading = false;
    })
    .addCase(removeItemOption.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
