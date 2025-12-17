import { createReducer } from '@reduxjs/toolkit';
import {
  addPriceModifier,
  editPriceModifier,
  fetchPriceModifierById,
  fetchPriceModifiers,
  removePriceModifier,
  setPriceModifiersBusinessId,
} from '@/actions/priceModifier';
import { ModelsasPriceModifierDto } from '@/api/types.gen';

export interface PriceModifierState {
  priceModifiers: ModelsasPriceModifierDto[];
  selectedPriceModifier?: ModelsasPriceModifierDto;
  selectedBusinessId?: number;
  loading: boolean;
  error?: string;
}

const initialState: PriceModifierState = {
  priceModifiers: [],
  selectedPriceModifier: undefined,
  selectedBusinessId: undefined,
  loading: false,
};

export const priceModifierReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setPriceModifiersBusinessId, (state, { payload }) => {
      state.selectedBusinessId = payload;
      state.priceModifiers = [];
      state.selectedPriceModifier = undefined;
      state.error = undefined;
    })
    // Fetch price modifiers
    .addCase(fetchPriceModifiers.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchPriceModifiers.fulfilled, (state, { payload }) => {
      state.priceModifiers = payload;
      state.loading = false;
    })
    .addCase(fetchPriceModifiers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Fetch price modifier by ID
    .addCase(fetchPriceModifierById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchPriceModifierById.fulfilled, (state, { payload }) => {
      state.selectedPriceModifier = payload;
      state.loading = false;
    })
    .addCase(fetchPriceModifierById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add price modifier
    .addCase(addPriceModifier.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addPriceModifier.fulfilled, (state, { payload }) => {
      state.priceModifiers.push(payload);
      state.loading = false;
    })
    .addCase(addPriceModifier.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Edit price modifier
    .addCase(editPriceModifier.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(editPriceModifier.fulfilled, (state, { payload }) => {
      state.priceModifiers = state.priceModifiers.map(
        (priceModifier: ModelsasPriceModifierDto) =>
        priceModifier.id === payload.id ? payload : priceModifier
      );
      state.selectedPriceModifier =
        state.selectedPriceModifier?.id === payload.id
          ? payload
          : state.selectedPriceModifier;
      state.loading = false;
    })
    .addCase(editPriceModifier.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Remove price modifier
    .addCase(removePriceModifier.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(removePriceModifier.fulfilled, (state, { payload }) => {
      state.priceModifiers = state.priceModifiers.filter(
        (priceModifier: ModelsasPriceModifierDto) =>
          priceModifier.id !== payload
      );
      if (state.selectedPriceModifier?.id === payload) {
        state.selectedPriceModifier = undefined;
      }
      state.loading = false;
    })
    .addCase(removePriceModifier.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
