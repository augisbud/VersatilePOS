import { Button, Space } from 'antd';
import {
  DollarOutlined,
  CreditCardOutlined,
  GiftOutlined,
} from '@ant-design/icons';

export type PaymentMethod = 'Cash' | 'CreditCard' | 'GiftCard';

const buttonStyle = {
  height: 56,
  fontSize: 16,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
} as const;

interface PaymentButtonsProps {
  isProcessing: boolean;
  onPayment: (method: PaymentMethod) => void;
}

export const PaymentButtons = ({
  isProcessing,
  onPayment,
}: PaymentButtonsProps) => {
  return (
    <div
      style={{
        width: 280,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Button
          block
          size="large"
          onClick={() => onPayment('Cash')}
          disabled={isProcessing}
          loading={isProcessing}
          style={{
            ...buttonStyle,
            background: '#52c41a',
            borderColor: '#52c41a',
            color: '#fff',
          }}
          icon={<DollarOutlined />}
        >
          Pay with Cash
        </Button>

        <Button
          block
          size="large"
          onClick={() => onPayment('CreditCard')}
          disabled={isProcessing}
          style={{
            ...buttonStyle,
            background: '#1890ff',
            borderColor: '#1890ff',
            color: '#fff',
          }}
          icon={<CreditCardOutlined />}
        >
          Pay with Card
        </Button>

        <Button
          block
          size="large"
          onClick={() => onPayment('GiftCard')}
          disabled={isProcessing}
          loading={isProcessing}
          style={{
            ...buttonStyle,
            background: '#faad14',
            borderColor: '#faad14',
            color: '#fff',
          }}
          icon={<GiftOutlined />}
        >
          Pay with Gift Card
        </Button>
      </Space>
    </div>
  );
};
