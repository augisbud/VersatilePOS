import { Card, Descriptions, Tag, Typography } from 'antd';
import { ModelsOrderDto } from '@/api/types.gen';

type Props = {
  order?: ModelsOrderDto | null;
};

const { Text } = Typography;

export const OrderDetailsCard = ({ order }: Props) => (
  <Card style={{ marginBottom: 16 }}>
    <Descriptions
      title="Order details"
      column={2}
      labelStyle={{ width: 160 }}
      size="small"
    >
      <Descriptions.Item label="Order #">
        {order?.id ? `#${order.id}` : '—'}
      </Descriptions.Item>
      <Descriptions.Item label="Status">
        {order?.status ? <Tag>{order.status}</Tag> : <Text type="secondary">Unknown</Text>}
      </Descriptions.Item>
      <Descriptions.Item label="Customer">{order?.customer || 'Walk-in'}</Descriptions.Item>
      <Descriptions.Item label="Placed at">
        {order?.datePlaced ? new Date(order.datePlaced).toLocaleString() : '—'}
      </Descriptions.Item>
    </Descriptions>
  </Card>
);
