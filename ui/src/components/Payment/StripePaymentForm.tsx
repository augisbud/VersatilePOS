import { Alert } from 'antd';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, useEffect } from 'react';
import { useStripePayment } from '@/hooks/useStripe';
import { CardInput } from './CardInput';
import { PaymentStatus } from './PaymentStatus';
import { PaymentActions } from './PaymentActions';
import { StripePaymentFormProps } from './types';

export const StripePaymentForm = ({
  amount,
  orderId,
  onSuccess,
  onCancel,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    status,
    error: stripeError,
    isProcessing,
    createPaymentIntent,
    completePayment,
    setConfirming,
    reset,
  } = useStripePayment();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!stripe || !elements) {
      setFormError('Stripe has not been initialized');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setFormError('Card element not found');
      return;
    }

    try {
      const intentResponse = await createPaymentIntent({
        amount,
        currency: 'usd',
        orderId,
      });

      const { clientSecret, paymentIntentId } = intentResponse;
      if (!clientSecret || !paymentIntentId) {
        throw new Error('Invalid payment intent response');
      }

      setConfirming();
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment confirmation failed');
      }

      if (!paymentIntent) {
        throw new Error('No payment intent returned from Stripe');
      }

      if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
        const result = await completePayment(paymentIntentId);
        onSuccess(result);
      } else if (paymentIntent.status === 'requires_action') {
        throw new Error('Additional authentication required. Please try again.');
      } else {
        throw new Error(`Unexpected payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setFormError(message);
    }
  };

  const displayError = formError || stripeError;

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      {displayError && (
        <Alert
          message={displayError}
          type="error"
          showIcon
          closable
          onClose={() => setFormError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <CardInput disabled={isProcessing} />
      <PaymentStatus status={status} />
      <PaymentActions
        amount={amount}
        isProcessing={isProcessing}
        isDisabled={!stripe || !elements}
        onCancel={onCancel}
      />
    </form>
  );
};
