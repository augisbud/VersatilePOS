import { StripeCardElementOptions } from '@stripe/stripe-js';

export const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#666ee8',
    },
    invalid: {
      color: '#e25950',
      iconColor: '#e25950',
    },
  },
  hidePostalCode: false,
};

export const STATUS_MESSAGES: Record<string, string> = {
  creating_intent: 'Creating payment...',
  confirming: 'Confirming with your card...',
  finding_payment: 'Finalizing payment...',
};

export const STRIPE_ELEMENTS_OPTIONS = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#1890ff',
      borderRadius: '6px',
    },
  },
};

