import { CardElement } from '@stripe/react-stripe-js';
import { CARD_ELEMENT_OPTIONS } from './constants';

type Props = {
  disabled?: boolean;
};

export const CardInput = ({ disabled }: Props) => (
  <div
    style={{
      padding: '12px 14px',
      border: '1px solid #d9d9d9',
      borderRadius: 6,
      marginBottom: 16,
      background: disabled ? '#fafafa' : '#fff',
      transition: 'background 0.2s',
    }}
  >
    <CardElement options={CARD_ELEMENT_OPTIONS} />
  </div>
);

