import { Button, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ModelsOrderDto } from '@/api/types.gen';

type Props = {
  orders: ModelsOrderDto[];
  loading: boolean;
  selectedBusinessId?: number | null;
  canReadOrders: boolean;
  onEdit: (order: ModelsOrderDto) => void;
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
}: Props) => {
  const columns: ColumnsType<ModelsOrderDto> = [
    {
      title: 'Order #',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
      sortDirections: ['descend', 'ascend'],
      render: (value?: number) => (value ? `#${value}` : '—'),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      sorter: (a, b) => (a.customer ?? '').localeCompare(b.customer ?? ''),
      sortDirections: ['ascend', 'descend'],
      render: (value?: string) => value || 'Walk-in',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => (a.status ?? '').localeCompare(b.status ?? ''),
      sortDirections: ['ascend', 'descend'],
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
      sorter: (a, b) => (a.serviceCharge ?? 0) - (b.serviceCharge ?? 0),
      sortDirections: ['descend', 'ascend'],
      render: (value?: number) =>
        value !== undefined ? `$${value.toFixed(2)}` : '—',
    },
    {
      title: 'Tip',
      dataIndex: 'tipAmount',
      key: 'tipAmount',
      sorter: (a, b) => (a.tipAmount ?? 0) - (b.tipAmount ?? 0),
      sortDirections: ['descend', 'ascend'],
      render: (value?: number) =>
        value !== undefined ? `$${value.toFixed(2)}` : '—',
    },
    {
      title: 'Placed At',
      dataIndex: 'datePlaced',
      key: 'datePlaced',
      sorter: (a, b) =>
        new Date(a.datePlaced ?? 0).getTime() - new Date(b.datePlaced ?? 0).getTime(),
      defaultSortOrder: 'descend',
      sortDirections: ['descend', 'ascend'],
      render: (value?: string) =>
        value ? new Date(value).toLocaleString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) =>
        canReadOrders ? (
          <Space size="small">
            <Button type="link" onClick={() => onEdit(record)}>
              Edit
            </Button>
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
