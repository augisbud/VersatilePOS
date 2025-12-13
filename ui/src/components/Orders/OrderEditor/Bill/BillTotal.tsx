import { Typography } from 'antd';

type Props = {
  total: number;
  label?: string;
  currency?: string;
};

const { Title } = Typography;

export const BillTotal = ({
  total,
  label = 'Total:',
  currency = 'EUR',
}: Props) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Title level={5} style={{ margin: 0 }}>
      {label}
    </Title>
    <Title level={5} style={{ margin: 0 }}>
      {total.toFixed(2)} {currency}
    </Title>
  </div>
);
