import { State } from '@/types/redux';
import {
  ModelsReservationDto,
  ConstantsReservationStatus,
} from '@/api/types.gen';

export const getReservations = (state: State) => state.reservation.reservations;

export const getSelectedReservation = (state: State) =>
  state.reservation.selectedReservation;

export const getReservationsLoading = (state: State) =>
  state.reservation.loading;

export const getReservationsError = (state: State) => state.reservation.error;

export const getReservationsByStatus = (
  reservations: ModelsReservationDto[],
  status: ConstantsReservationStatus
) => reservations.filter((reservation) => reservation.status === status);

export const getReservationById = (
  reservations: ModelsReservationDto[],
  id: number
) => reservations.find((reservation) => reservation.id === id);
