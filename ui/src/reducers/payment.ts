import { createReducer } from '@reduxjs/toolkit';
import { addPayment, fetchPayments } from '@/actions/payment';
import { ModelsPaymentDto } from '@/api/types.gen';

export interface PaymentState {
  payments: ModelsPaymentDto[];
  loading: boolean;
  error?: string;
}

const initialState: PaymentState = {
  payments: [],
  loading: false,
};

export const paymentReducer = createReducer(initialState, (builder) => {
  builder
    // Fetch payments
    .addCase(fetchPayments.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchPayments.fulfilled, (state, { payload }) => {
      state.payments = payload;
      state.loading = false;
    })
    .addCase(fetchPayments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    // Add payment
    .addCase(addPayment.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addPayment.fulfilled, (state, { payload }) => {
      state.payments.push(payload);
      state.loading = false;
    })
    .addCase(addPayment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
