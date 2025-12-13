import { Modal, Button, message } from 'antd';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useState, useCallback } from 'react';
import { createStripePaymentIntent } from '@/api/stripe';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

type Props = {
  open: boolean;
  amount: number;
  orderId?: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
};

const StripePaymentForm = ({
  amount,
  orderId,
  onSuccess,
  onCancel,
}: Omit<Props, 'open'>) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setLoading(true);

      try {
        // Create payment intent
        const { clientSecret, paymentIntentId } =
          await createStripePaymentIntent({
            amount,
            currency: 'usd',
            orderId,
          });

        // Confirm payment with Stripe
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card element not found');
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
            },
          }
        );

        if (error) {
          void message.error(error.message || 'Payment failed');
          setLoading(false);
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          void message.success('Payment successful!');
          onSuccess(paymentIntentId);
        } else {
          void message.error('Payment was not completed');
          setLoading(false);
        }
      } catch (err) {
        console.error('Payment error:', err);
        void message.error('Failed to process payment');
        setLoading(false);
      }
    },
    [stripe, elements, amount, orderId, onSuccess]
  );

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 24 }}>
        <CardElement options={cardElementOptions} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Pay ${amount.toFixed(2)}
        </Button>
      </div>
    </form>
  );
};

export const StripePaymentModal = ({
  open,
  amount,
  orderId,
  onSuccess,
  onCancel,
}: Props) => {
  const stripePublishableKey =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

  if (!stripePublishableKey) {
    return (
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        title="Card Payment"
        centered
      >
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          Stripe is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY
          environment variable.
        </div>
      </Modal>
    );
  }

  const options: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title="Card Payment"
      centered
      width={500}
    >
      <Elements stripe={stripePromise} options={options}>
        <StripePaymentForm
          amount={amount}
          orderId={orderId}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </Modal>
  );
};
