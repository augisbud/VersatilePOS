import { Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

type Props = {
  customer?: string;
};

const { Text } = Typography;

export const OrderCardCustomer = ({ customer }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}
    >
      <UserOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
      <Text strong style={{ fontSize: 14 }}>
        {customer || 'Walk-in Customer'}
      </Text>
    </div>
  );
};
