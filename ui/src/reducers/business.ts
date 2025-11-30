import {
  createBusiness,
  fetchBusinessById,
  fetchBusinesses,
} from '@/actions/business';
import { createReducer } from '@reduxjs/toolkit';
import { ModelsBusinessDto } from '@/api/types.gen';

export interface BusinessState {
  businesses: ModelsBusinessDto[];
  loading: boolean;
  error?: string;
}

const initialState: BusinessState = {
  businesses: [],
  loading: false,
};

export const businessReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(createBusiness.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(createBusiness.fulfilled, (state, { payload }) => {
      state.businesses.push(payload);
      state.loading = false;
      state.error = undefined;
    })
    .addCase(createBusiness.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || 'Failed to create business';
    })
    .addCase(fetchBusinessById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchBusinessById.fulfilled, (state, { payload }) => {
      state.businesses = [payload];
      state.loading = false;
      state.error = undefined;
    })
    .addCase(fetchBusinessById.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || 'Failed to fetch business';
    })
    .addCase(fetchBusinesses.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchBusinesses.fulfilled, (state, { payload }) => {
      state.businesses = Array.isArray(payload) ? payload : [];
      state.loading = false;
      state.error = undefined;
    })
    .addCase(fetchBusinesses.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || 'Failed to fetch businesses';
    });
});
