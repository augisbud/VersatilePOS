import { useState } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { createStripeIntent as createStripeIntentAction } from '@/actions/payment';
import { fetchPayments as fetchPaymentsAction } from '@/actions/payment';
import {
  ModelsCreateStripePaymentRequest,
  ModelsPaymentDto,
} from '@/api/types.gen';

const POLLING_INTERVAL_MS = 500;
const DEFAULT_MAX_ATTEMPTS = 20;

export type StripePaymentStatus =
  | 'idle'
  | 'creating_intent'
  | 'awaiting_confirmation'
  | 'confirming'
  | 'finding_payment'
  | 'completed'
  | 'failed';

export type StripePaymentResult = {
  paymentId: number;
  paymentIntentId: string;
  status: 'Completed' | 'Pending';
};

export const isStripeConfigured = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return !!key && key.length > 0;
};

export const getStripePublishableKey = () => {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
};

export type UseStripePaymentOptions = {
  onStatusChange?: (status: StripePaymentStatus) => void;
};

export const useStripePayment = (options?: UseStripePaymentOptions) => {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<StripePaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const updateStatus = (newStatus: StripePaymentStatus) => {
    setStatus(newStatus);
    options?.onStatusChange?.(newStatus);
  };

  const createPaymentIntent = async (request: ModelsCreateStripePaymentRequest) => {
    setError(null);
    updateStatus('creating_intent');

    try {
      const response = await dispatch(createStripeIntentAction(request)).unwrap();

      if (!response.clientSecret || !response.paymentIntentId) {
        throw new Error('Invalid payment intent response');
      }

      updateStatus('awaiting_confirmation');
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create payment intent';
      setError(message);
      updateStatus('failed');
      throw err;
    }
  };

  const findPaymentByIntentId = async (
    paymentIntentId: string,
    maxAttempts = DEFAULT_MAX_ATTEMPTS
  ): Promise<ModelsPaymentDto | null> => {
    updateStatus('finding_payment');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const payments = await dispatch(fetchPaymentsAction()).unwrap();
        const payment = payments.find(
          (p) => p.stripePaymentIntentId === paymentIntentId
        );

        if (payment) {
          if (payment.status === 'Completed') {
            return payment;
          }
          if (attempt >= 3) {
            return payment;
          }
        }
      } catch (err) {
        console.error('Error polling for payment:', err);
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
    }

    try {
      const payments = await dispatch(fetchPaymentsAction()).unwrap();
      return payments.find((p) => p.stripePaymentIntentId === paymentIntentId) || null;
    } catch {
      return null;
    }
  };

  const completePayment = async (paymentIntentId: string): Promise<StripePaymentResult> => {
    const payment = await findPaymentByIntentId(paymentIntentId);

    if (!payment?.id) {
      const message = 'Payment was processed but could not be found in database';
      setError(message);
      updateStatus('failed');
      throw new Error(message);
    }

    updateStatus('completed');
    return {
      paymentId: payment.id,
      paymentIntentId,
      status: payment.status === 'Completed' ? 'Completed' : 'Pending',
    };
  };

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  const setConfirming = () => {
    updateStatus('confirming');
  };

  return {
    status,
    error,
    isProcessing: status !== 'idle' && status !== 'completed' && status !== 'failed',
    createPaymentIntent,
    findPaymentByIntentId,
    completePayment,
    setConfirming,
    reset,
  };
};
