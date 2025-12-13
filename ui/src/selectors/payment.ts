import { State } from '@/types/redux';
import { ModelsPaymentDto } from '@/api/types.gen';

export const getPayments = (state: State): ModelsPaymentDto[] =>
  state.payment.payments;

export const getPaymentsLoading = (state: State): boolean =>
  state.payment.loading;

export const getPaymentsError = (state: State): string | undefined =>
  state.payment.error;

export const getPaymentById = (
  payments: ModelsPaymentDto[],
  id: number
): ModelsPaymentDto | undefined =>
  payments.find((payment) => payment.id === id);

export const getPaymentsByStatus = (
  payments: ModelsPaymentDto[],
  status: string
): ModelsPaymentDto[] =>
  payments.filter((payment) => payment.status === status);

export const getPaymentsByType = (
  payments: ModelsPaymentDto[],
  type: string
): ModelsPaymentDto[] => payments.filter((payment) => payment.type === type);

export const getTotalPaymentsAmount = (payments: ModelsPaymentDto[]): number =>
  payments.reduce((total, payment) => total + (payment.amount ?? 0), 0);
