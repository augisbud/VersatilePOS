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
    const response = await fetch(`http://localhost:8080/payment/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to complete payment: ${response.status} ${errorText}`);
    }

    // Refresh payments to get updated status
    return dispatch(fetchPaymentsAction()).unwrap();
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
