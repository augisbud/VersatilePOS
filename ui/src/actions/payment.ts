import { ModelsCreatePaymentRequest, ModelsPaymentDto } from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { createPayment, getPayments } from '@/api';

export const fetchPayments = createAsyncThunk<ModelsPaymentDto[], void>(
  'payment/fetchPayments',
  async () => {
    const response = await getPayments();

    if (response.error) {
      throw new Error(response.error.error);
    }

    return Array.isArray(response.data) ? response.data : [];
  }
);

export const addPayment = createAsyncThunk<
  ModelsPaymentDto,
  ModelsCreatePaymentRequest
>('payment/addPayment', async (paymentData: ModelsCreatePaymentRequest) => {
  const response = await createPayment({ body: paymentData });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from createPayment');
  }

  return response.data;
});
