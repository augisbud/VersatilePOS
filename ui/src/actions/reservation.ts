import {
  ModelsReservationDto,
  ModelsCreateReservationRequest,
  ModelsUpdateReservationRequest,
} from '@/api/types.gen';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  linkPaymentToReservation,
} from '@/api';

export const fetchReservations = createAsyncThunk<ModelsReservationDto[], void>(
  'reservation/fetchReservations',
  async () => {
    const response = await getReservations();

    if (response.error) {
      throw new Error(response.error.error);
    }

    return Array.isArray(response.data) ? response.data : [];
  }
);

export const fetchReservationById = createAsyncThunk<
  ModelsReservationDto,
  number
>('reservation/fetchReservationById', async (reservationId: number) => {
  const response = await getReservationById({ path: { id: reservationId } });

  if (response.error) {
    throw new Error(response.error.error);
  }

  if (!response.data) {
    throw new Error('No data returned from getReservationById');
  }

  return response.data;
});

export const addReservation = createAsyncThunk<
  ModelsReservationDto,
  ModelsCreateReservationRequest
>(
  'reservation/addReservation',
  async (reservationData: ModelsCreateReservationRequest) => {
    const response = await createReservation({ body: reservationData });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from createReservation');
    }

    return response.data;
  }
);

export const editReservation = createAsyncThunk<
  ModelsReservationDto,
  { id: number; data: ModelsUpdateReservationRequest }
>(
  'reservation/editReservation',
  async ({
    id,
    data,
  }: {
    id: number;
    data: ModelsUpdateReservationRequest;
  }) => {
    const response = await updateReservation({ path: { id }, body: data });

    if (response.error) {
      throw new Error(response.error.error);
    }

    if (!response.data) {
      throw new Error('No data returned from updateReservation');
    }

    return response.data;
  }
);

export const linkPayment = createAsyncThunk<
  { reservationId: number; paymentId: number },
  { reservationId: number; paymentId: number }
>('reservation/linkPayment', async ({ reservationId, paymentId }) => {
  const response = await linkPaymentToReservation({
    path: { reservationId, paymentId },
  });

  if (response.error) {
    throw new Error(response.error.error);
  }

  return { reservationId, paymentId };
});
