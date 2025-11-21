import { createBusiness, fetchBusinessById } from '@/actions/business';
import { createReducer } from '@reduxjs/toolkit';

export interface BusinessState {
  identBusiness?: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  ownerAccount?: {
    identAccount?: number;
    name?: string;
    username?: string;
  };
  loading: boolean;
  error?: string;
}

const initialState: BusinessState = {
  loading: false,
};

export const businessReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(createBusiness.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(createBusiness.fulfilled, (state, action) => {
      const business = action.payload;
      state.identBusiness = business.identBusiness;
      state.name = business.name;
      state.email = business.email;
      state.phone = business.phone;
      state.address = business.address;
      state.ownerAccount = business.ownerAccount;
      state.loading = false;
      state.error = undefined;
    })
    .addCase(createBusiness.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create business';
    })
    .addCase(fetchBusinessById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchBusinessById.fulfilled, (state, action) => {
      const business = action.payload;
      state.identBusiness = business.identBusiness;
      state.name = business.name;
      state.email = business.email;
      state.phone = business.phone;
      state.address = business.address;
      state.ownerAccount = business.ownerAccount;
      state.loading = false;
      state.error = undefined;
    })
    .addCase(fetchBusinessById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch business';
    });
});
