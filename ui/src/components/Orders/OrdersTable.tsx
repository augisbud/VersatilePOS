import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ModelsOrderDto } from '@/api/types.gen';

type Props = {
  orders: ModelsOrderDto[];
  loading: boolean;
  selectedBusinessId?: number | null;
  canReadOrders: boolean;
  onEdit: (order: ModelsOrderDto) => void;
  onItems: (orderId: number) => void;
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  Pending: 'blue',
  Completed: 'green',
  Cancelled: 'red',
};

export const OrdersTable = ({
  orders,
  loading,
  selectedBusinessId,
  canReadOrders,
  onEdit,
  onItems,
}: Props) => {
  const columns: ColumnsType<ModelsOrderDto> = [
    {
      title: 'Order #',
      dataIndex: 'id',
      key: 'id',
      render: (value?: number) => (value ? `#${value}` : '—'),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (value?: string) => value || 'Walk-in',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value?: string) => {
        const color = value
          ? (ORDER_STATUS_COLOR[value] ?? 'default')
          : 'default';
        return value ? <Tag color={color}>{value}</Tag> : <Tag>Unknown</Tag>;
      },
    },
    {
      title: 'Service Charge',
      dataIndex: 'serviceCharge',
      key: 'serviceCharge',
      render: (value?: number) =>
        value !== undefined ? `$${value.toFixed(2)}` : '—',
    },
    {
      title: 'Tip',
      dataIndex: 'tipAmount',
      key: 'tipAmount',
      render: (value?: number) =>
        value !== undefined ? `$${value.toFixed(2)}` : '—',
    },
    {
      title: 'Placed At',
      dataIndex: 'datePlaced',
      key: 'datePlaced',
      render: (value?: string) =>
        value ? new Date(value).toLocaleString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) =>
        canReadOrders ? (
          <Space size="small">
            <Button type="link" onClick={() => onEdit(record)}>
              Edit
            </Button>
            {record.id && (
              <Button
                type="link"
                onClick={() => record.id && onItems(record.id)}
              >
                Items
              </Button>
            )}
          </Space>
        ) : null,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} orders`,
      }}
      locale={{
        emptyText: selectedBusinessId
          ? 'No orders found for this business.'
          : 'Select a business to view orders.',
      }}
    />
  );
};
