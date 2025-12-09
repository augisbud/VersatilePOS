import { Button, Space, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

type Props = {
  selectedBusinessId?: number | null;
  onNewOrder: () => void;
  onRefresh: () => void;
};

const { Title, Text } = Typography;

export const OrdersHeader = ({
  selectedBusinessId,
  onNewOrder,
  onRefresh,
}: Props) => (
  <div
    style={{
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <div>
      <Title level={2} style={{ margin: 0 }}>
        Orders
      </Title>
      <Text type="secondary">View orders for your selected business.</Text>
    </div>

    <Space>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onNewOrder}
        disabled={!selectedBusinessId}
      >
        New Order
      </Button>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} disabled={!selectedBusinessId}>
        Refresh
      </Button>
    </Space>
  </div>
);
