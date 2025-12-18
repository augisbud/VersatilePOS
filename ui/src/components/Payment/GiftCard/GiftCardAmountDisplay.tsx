import { Typography } from 'antd';

const { Text, Title } = Typography;

interface GiftCardAmountDisplayProps {
  amount: number;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export const GiftCardAmountDisplay = ({
  amount,
}: GiftCardAmountDisplayProps) => (
  <div
    style={{
      background: '#fafafa',
      borderRadius: 8,
      padding: 16,
      textAlign: 'center',
      marginBottom: 24,
    }}
  >
    <Text type="secondary">Amount to Pay</Text>
    <Title level={2} style={{ margin: '8px 0 0', color: '#faad14' }}>
      {formatCurrency(amount)}
    </Title>
  </div>
);
