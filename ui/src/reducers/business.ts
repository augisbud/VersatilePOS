import { createBusiness, fetchBusinessById } from '@/actions/business';
import { createReducer } from '@reduxjs/toolkit';

export interface BusinessState {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  loading: boolean;
  error?: string;
}

const initialState: BusinessState = {
  id: 3,
  loading: false,
};

export const businessReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(createBusiness.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(createBusiness.fulfilled, (state, { payload }) => {
      // state.id = payload.id;
      state.name = payload.name;
      state.email = payload.email;
      state.phone = payload.phone;
      state.address = payload.address;
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
      // state.id = payload.id;
      state.name = payload.name;
      state.email = payload.email;
      state.phone = payload.phone;
      state.address = payload.address;
      state.loading = false;
      state.error = undefined;
    })
    .addCase(fetchBusinessById.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || 'Failed to fetch business';
    });
});
