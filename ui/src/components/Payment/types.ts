import { StripePaymentResult } from '@/hooks/useStripe';

export type StripePaymentFormProps = {
  amount: number;
  orderId?: number;
  onSuccess: (result: StripePaymentResult) => void;
  onCancel: () => void;
};

export type StripePaymentModalProps = {
  open: boolean;
  amount: number;
  orderId?: number;
  onSuccess: (result: StripePaymentResult) => void;
  onCancel: () => void;
};

export type { StripePaymentResult };

