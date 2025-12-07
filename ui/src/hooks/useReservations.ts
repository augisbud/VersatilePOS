import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getReservations,
  getSelectedReservation,
  getReservationsLoading,
  getReservationsError,
} from '@/selectors/reservation';
import {
  fetchReservations as fetchReservationsAction,
  fetchReservationById as fetchReservationByIdAction,
  addReservation as addReservationAction,
  editReservation as editReservationAction,
} from '@/actions/reservation';
import {
  ModelsCreateReservationRequest,
  ModelsUpdateReservationRequest,
} from '@/api/types.gen';

export const useReservations = () => {
  const dispatch = useAppDispatch();
  const reservations = useAppSelector(getReservations);
  const selectedReservation = useAppSelector(getSelectedReservation);
  const loading = useAppSelector(getReservationsLoading);
  const error = useAppSelector(getReservationsError);

  const fetchReservations = async () => {
    return dispatch(fetchReservationsAction()).unwrap();
  };

  const fetchReservationById = async (reservationId: number) => {
    return dispatch(fetchReservationByIdAction(reservationId)).unwrap();
  };

  const createReservation = async (
    reservationData: ModelsCreateReservationRequest
  ) => {
    return dispatch(addReservationAction(reservationData)).unwrap();
  };

  const updateReservation = async (
    id: number,
    data: ModelsUpdateReservationRequest
  ) => {
    return dispatch(editReservationAction({ id, data })).unwrap();
  };

  return {
    reservations,
    selectedReservation,
    loading,
    error,
    fetchReservations,
    fetchReservationById,
    createReservation,
    updateReservation,
  };
};
