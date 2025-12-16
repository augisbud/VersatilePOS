import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import {
  getPayments,
  getPaymentsLoading,
  getPaymentsError,
  getPaymentById as getPaymentByIdSelector,
  getPaymentsByStatus as getPaymentsByStatusSelector,
  getPaymentsByType as getPaymentsByTypeSelector,
  getTotalPaymentsAmount as getTotalPaymentsAmountSelector,
} from '@/selectors/payment';
import {
  fetchPayments as fetchPaymentsAction,
  addPayment as addPaymentAction,
  completePaymentAction,
} from '@/actions/payment';
import { linkPayment as linkPaymentAction } from '@/actions/order';
import { ModelsCreatePaymentRequest } from '@/api/types.gen';

export const usePayments = () => {
  const dispatch = useAppDispatch();
  const payments = useAppSelector(getPayments);
  const loading = useAppSelector(getPaymentsLoading);
  const error = useAppSelector(getPaymentsError);

  const fetchPayments = async () => {
    return dispatch(fetchPaymentsAction()).unwrap();
  };

  const createPayment = async (paymentData: ModelsCreatePaymentRequest) => {
    return dispatch(addPaymentAction(paymentData)).unwrap();
  };

  const linkPaymentToOrder = async (orderId: number, paymentId: number) => {
    return dispatch(linkPaymentAction({ orderId, paymentId })).unwrap();
  };

  const completePayment = async (paymentId: number) => {
    await dispatch(completePaymentAction(paymentId)).unwrap();
    return fetchPayments();
  };

  const getPaymentById = (paymentId: number) => {
    return getPaymentByIdSelector(payments, paymentId);
  };

  const getPaymentsByStatus = (status: string) => {
    return getPaymentsByStatusSelector(payments, status);
  };

  const getPaymentsByType = (type: string) => {
    return getPaymentsByTypeSelector(payments, type);
  };

  const getTotalPaymentsAmount = () => {
    return getTotalPaymentsAmountSelector(payments);
  };

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    linkPaymentToOrder,
    completePayment,
    getPaymentById,
    getPaymentsByStatus,
    getPaymentsByType,
    getTotalPaymentsAmount,
  };
};
