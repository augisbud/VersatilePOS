import {
  ModelsCreatePaymentRequest,
  ModelsPaymentDto,
  ModelsCreateStripePaymentRequest,
  ModelsCreateStripePaymentResponse,
} from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createPayment,
  getPayments,
  createStripePaymentIntent,
  completePayment,
} from '@/api';

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

export const createStripeIntent = createAsyncThunk<
  ModelsCreateStripePaymentResponse,
  ModelsCreateStripePaymentRequest
>(
  'payment/createStripeIntent',
  async (stripePaymentData: ModelsCreateStripePaymentRequest) => {
    const response = await createStripePaymentIntent({
      body: stripePaymentData,
    });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from createStripePaymentIntent');
    }

    return response.data;
  }
);

export const completePaymentAction = createAsyncThunk<
  { paymentId: number },
  number
>('payment/completePayment', async (paymentId: number) => {
  const response = await completePayment({ path: { id: paymentId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return { paymentId };
});
