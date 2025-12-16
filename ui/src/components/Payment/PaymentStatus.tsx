import { Spin, Typography } from 'antd';
import { STATUS_MESSAGES } from './constants';
import { StripePaymentStatus } from '@/hooks/useStripe';

const { Text } = Typography;

type Props = {
  status: StripePaymentStatus;
};

export const PaymentStatus = ({ status }: Props) => {
  const message = STATUS_MESSAGES[status];

  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        color: '#1890ff',
      }}
    >
      <Spin size="small" />
      <Text type="secondary">{message}</Text>
    </div>
  );
};

