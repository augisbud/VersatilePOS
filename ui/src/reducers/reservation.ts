import { createReducer } from '@reduxjs/toolkit';
import {
  fetchReservations,
  fetchReservationById,
  addReservation,
  editReservation,
} from '@/actions/reservation';
import { ModelsReservationDto } from '@/api/types.gen';

export interface ReservationState {
  reservations: ModelsReservationDto[];
  selectedReservation?: ModelsReservationDto;
  loading: boolean;
  error?: string;
}

const initialState: ReservationState = {
  reservations: [],
  selectedReservation: undefined,
  loading: false,
};

export const reservationReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(fetchReservations.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchReservations.fulfilled, (state, { payload }) => {
      state.reservations = payload;
      state.loading = false;
    })
    .addCase(fetchReservations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(fetchReservationById.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(fetchReservationById.fulfilled, (state, { payload }) => {
      state.selectedReservation = payload;
      state.loading = false;
    })
    .addCase(fetchReservationById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(addReservation.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(addReservation.fulfilled, (state, { payload }) => {
      state.reservations.push(payload);
      state.loading = false;
    })
    .addCase(addReservation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    })
    .addCase(editReservation.pending, (state) => {
      state.loading = true;
      state.error = undefined;
    })
    .addCase(editReservation.fulfilled, (state, { payload }) => {
      state.reservations = state.reservations.map((r) =>
        r.id === payload.id ? payload : r
      );
      state.selectedReservation =
        state.selectedReservation?.id === payload.id
          ? payload
          : state.selectedReservation;
      state.loading = false;
    })
    .addCase(editReservation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
});
