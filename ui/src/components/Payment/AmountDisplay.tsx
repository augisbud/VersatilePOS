import { Typography } from 'antd';

const { Text } = Typography;

type Props = {
  amount: number;
};

export const AmountDisplay = ({ amount }: Props) => (
  <div
    style={{
      background: '#f5f5f5',
      borderRadius: 8,
      padding: '12px 16px',
      marginBottom: 20,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Text type="secondary">Amount to pay</Text>
    <Text strong style={{ fontSize: 20 }}>
      ${amount.toFixed(2)}
    </Text>
  </div>
);

