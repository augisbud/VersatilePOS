import { Space, Table, Typography, Button, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { ModelsItemDto } from '@/api/types.gen';

type Props = {
  items: ModelsItemDto[];
  loading: boolean;
  canWriteItems: boolean;
  selectedBusinessId?: number | null;
  onEdit: (item: ModelsItemDto) => void;
  onDelete: (itemId: number) => void;
};

const { Text } = Typography;

export const ItemsTable = ({
  items,
  loading,
  canWriteItems,
  selectedBusinessId,
  onEdit,
  onDelete,
}: Props) => {
  const columns: ColumnsType<ModelsItemDto> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => <Text strong>{value}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (value?: number) => (value !== undefined ? `$${value.toFixed(2)}` : '-'),
    },
    {
      title: 'Quantity in Stock',
      dataIndex: 'quantityInStock',
      key: 'quantityInStock',
      render: (value?: number) => (value !== undefined ? value : '—'),
    },
  ];

  if (canWriteItems) {
    columns.push({
      title: '',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete item"
            description="Are you sure you want to delete this item?"
            onConfirm={() => record.id && onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={items}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      }}
      locale={{
        emptyText: selectedBusinessId
          ? 'No items found for this business.'
          : 'Select a business to view items.',
      }}
    />
  );
};
