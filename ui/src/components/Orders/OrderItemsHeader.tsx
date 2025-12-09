import { Button, Space, Typography } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';

type Props = {
  onBack: () => void;
  onRefresh: () => void;
  loading?: boolean;
  hasOrderId?: boolean;
};

const { Title } = Typography;

export const OrderItemsHeader = ({
  onBack,
  onRefresh,
  loading,
  hasOrderId,
}: Props) => (
  <Space
    style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}
  >
    <Space>
      <Button icon={<ArrowLeftOutlined />} onClick={onBack} type="text">
        Back to orders
      </Button>
      <Title level={3} style={{ margin: 0 }}>
        Order Items
      </Title>
    </Space>
    <Button
      icon={<ReloadOutlined />}
      onClick={onRefresh}
      disabled={loading || !hasOrderId}
    >
      Refresh
    </Button>
  </Space>
);
