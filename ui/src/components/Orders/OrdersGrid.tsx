import {
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Select,
  Space,
  Typography,
} from 'antd';
import { useState } from 'react';
import { ModelsOrderDto } from '@/api/types.gen';
import { OrderCard } from './OrderCard';

type Props = {
  orders: ModelsOrderDto[];
  loading: boolean;
  canWriteOrders: boolean;
  selectedBusinessId?: number | null;
  orderItemsSubtotals?: Record<number, number>;
  onEdit: (order: ModelsOrderDto) => void;
  onCancel: (orderId: number) => void;
  onRefund: (orderId: number) => void;
};

type StatusFilter =
  | 'all'
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Refunded'
  | 'Cancelled';

const { Text } = Typography;

export const OrdersGrid = ({
  orders,
  loading,
  canWriteOrders,
  selectedBusinessId,
  orderItemsSubtotals = {},
  onEdit,
  onCancel,
  onRefund,
}: Props) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const statusCounts = {
    all: orders.length,
    Pending: orders.filter((o) => o.status === 'Pending').length,
    Confirmed: orders.filter((o) => o.status === 'Confirmed').length,
    Completed: orders.filter((o) => o.status === 'Completed').length,
    Refunded: orders.filter((o) => o.status === 'Refunded').length,
    Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  if (!selectedBusinessId) {
    return (
      <Card
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary">Select a business to view orders</Text>
          }
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <Skeleton.Input active size="small" style={{ width: 200 }} />
        </div>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <Col key={key} xs={24} sm={12} md={8} lg={6}>
              <Card style={{ borderRadius: 16 }}>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          ))}
        </Row>
      </>
    );
  }

  if (orders.length === 0) {
    return (
      <Card
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text type="secondary">No orders found for this business</Text>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space size={8}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Filter by status:
          </Text>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: `All Orders (${statusCounts.all})` },
              { value: 'Pending', label: `Pending (${statusCounts.Pending})` },
              {
                value: 'Confirmed',
                label: `Confirmed (${statusCounts.Confirmed})`,
              },
              {
                value: 'Completed',
                label: `Completed (${statusCounts.Completed})`,
              },
              {
                value: 'Refunded',
                label: `Refunded (${statusCounts.Refunded})`,
              },
              {
                value: 'Cancelled',
                label: `Cancelled (${statusCounts.Cancelled})`,
              },
            ]}
          />
        </Space>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Showing {filteredOrders.length} of {orders.length} orders
        </Text>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card
          style={{
            borderRadius: 16,
            background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">
                No {statusFilter.toLowerCase()} orders found
              </Text>
            }
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredOrders.map((order) => (
            <Col key={order.id} xs={24} sm={12} md={8} lg={6}>
              <OrderCard
                order={order}
                canWriteOrders={canWriteOrders}
                itemsSubtotal={order.id ? orderItemsSubtotals[order.id] : undefined}
                onEdit={onEdit}
                onCancel={onCancel}
                onRefund={onRefund}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
