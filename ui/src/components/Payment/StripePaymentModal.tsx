import { Modal } from 'antd';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useMemo } from 'react';
import { isStripeConfigured, getStripePublishableKey } from '@/hooks/useStripe';
import { StripePaymentForm } from './StripePaymentForm';
import { StripeNotConfigured } from './StripeNotConfigured';
import { AmountDisplay } from './AmountDisplay';
import { STRIPE_ELEMENTS_OPTIONS } from './constants';
import { StripePaymentModalProps } from './types';

export const StripePaymentModal = ({
  open,
  amount,
  orderId,
  onSuccess,
  onCancel,
}: StripePaymentModalProps) => {
  const stripePromise = useMemo(() => {
    const key = getStripePublishableKey();
    return key ? loadStripe(key) : null;
  }, []);

  if (!isStripeConfigured()) {
    return <StripeNotConfigured open={open} onClose={onCancel} />;
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Card Payment</span>
        </div>
      }
      centered
      width={440}
      maskClosable={false}
      destroyOnHidden
    >
      <div style={{ padding: '8px 0' }}>
        <AmountDisplay amount={amount} />

        <Elements stripe={stripePromise} options={STRIPE_ELEMENTS_OPTIONS}>
          <StripePaymentForm
            amount={amount}
            orderId={orderId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </div>
    </Modal>
  );
};
