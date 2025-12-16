import { Divider, Typography } from 'antd';
import { formatCurrency } from '@/utils/formatters';

const { Text } = Typography;

interface PaymentSummaryProps {
  baseAmount: number;
  tipAmount: number;
  totalAmount: number;
}

export const PaymentSummary = ({
  baseAmount,
  tipAmount,
  totalAmount,
}: PaymentSummaryProps) => {
  return (
    <>
      <Divider style={{ margin: '16px 0' }} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text type="secondary">Subtotal</Text>
        <Text strong>{formatCurrency(baseAmount)}</Text>
      </div>

      {tipAmount > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text type="secondary">Tip</Text>
          <Text strong>{formatCurrency(tipAmount)}</Text>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 8,
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <Text strong style={{ fontSize: 16 }}>
          Total
        </Text>
        <Text strong style={{ fontSize: 16 }}>
          {formatCurrency(totalAmount)}
        </Text>
      </div>
    </>
  );
};
