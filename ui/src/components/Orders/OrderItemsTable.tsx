import { Button, InputNumber, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { ModelsOrderItemDto } from '@/api/types.gen';

type Props = {
  items: ModelsOrderItemDto[];
  itemLookup: Record<number, string>;
  counts: Record<number, number>;
  canWriteOrders: boolean;
  loading?: boolean;
  onCountChange: (itemId: number, value: number | null) => void;
  onSave: (item: ModelsOrderItemDto) => void;
  onRemove: (item: ModelsOrderItemDto) => void;
};

const { Text } = Typography;

export const OrderItemsTable = ({
  items,
  itemLookup,
  counts,
  canWriteOrders,
  loading,
  onCountChange,
  onSave,
  onRemove,
}: Props) => {
  const columns: ColumnsType<ModelsOrderItemDto> = [
    {
      title: 'Item',
      dataIndex: 'itemId',
      key: 'itemId',
      render: (value?: number) => {
        if (!value) return '—';
        const name = itemLookup[value];
        return name ? `${name} (#${value})` : `Item #${value}`;
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'count',
      key: 'count',
      width: 160,
      render: (_: number | undefined, record) => {
        const current =
          record.id !== undefined ? counts[record.id] : record.count;
        return (
          <InputNumber
            min={1}
            value={current ?? 1}
            onChange={(value) => record.id && onCountChange(record.id, value)}
            disabled={!canWriteOrders}
          />
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) =>
        record.id && canWriteOrders ? (
          <Space size="small">
            <Button
              type="link"
              icon={<SaveOutlined />}
              onClick={() => onSave(record)}
            >
              Save
            </Button>
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemove(record)}
            >
              Remove
            </Button>
          </Space>
        ) : (
          <Text type="secondary">No actions</Text>
        ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={items}
      rowKey={(record) => record.id ?? `${record.itemId}-${record.orderId}`}
      loading={loading}
      pagination={false}
      locale={{
        emptyText: 'No items found for this order.',
      }}
    />
  );
};
