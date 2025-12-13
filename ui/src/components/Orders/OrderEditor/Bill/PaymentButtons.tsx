import { Button } from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  WalletOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { PaymentType } from './types';

type Props = {
  onPayment: (paymentType: PaymentType) => void;
  onAddTip: () => void;
  disabled?: boolean;
};

const buttonStyle = {
  height: 56,
  fontSize: 16,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
} as const;

export const PaymentButtons = ({ onPayment, onAddTip, disabled }: Props) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: 140,
      flexShrink: 0,
    }}
  >
    <Button
      block
      size="large"
      onClick={onAddTip}
      disabled={disabled}
      style={buttonStyle}
      icon={<WalletOutlined />}
    >
      TIP
    </Button>
    <Button
      block
      type="primary"
      size="large"
      onClick={() => onPayment('Cash')}
      disabled={disabled}
      style={{
        ...buttonStyle,
        background: disabled ? undefined : '#52c41a',
        borderColor: disabled ? undefined : '#52c41a',
      }}
      icon={<DollarOutlined />}
    >
      CASH
    </Button>
    <Button
      block
      type="primary"
      size="large"
      onClick={() => onPayment('CreditCard')}
      disabled={disabled}
      style={{
        ...buttonStyle,
        background: disabled ? undefined : '#1890ff',
        borderColor: disabled ? undefined : '#1890ff',
      }}
      icon={<CreditCardOutlined />}
    >
      CARD
    </Button>
    <Button
      block
      size="large"
      onClick={() => onPayment('GiftCard')}
      disabled={disabled}
      style={{
        ...buttonStyle,
        background: disabled ? undefined : '#faad14',
        borderColor: disabled ? undefined : '#faad14',
        color: disabled ? undefined : '#fff',
      }}
      icon={<GiftOutlined />}
    >
      GIFT CARD
    </Button>
  </div>
);
