import { Button, Popconfirm, Space, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ItemWithInventory } from './ItemFormModal';

const { Text } = Typography;

interface GetItemColumnsParams {
  canWriteItems: boolean;
  onEdit: (item: ItemWithInventory) => void;
  onDelete: (itemId: number) => void;
}

export const getItemColumns = ({
  canWriteItems,
  onEdit,
  onDelete,
}: GetItemColumnsParams): ColumnsType<ItemWithInventory> => {
  const columns: ColumnsType<ItemWithInventory> = [
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
      render: (value?: number) =>
        value !== undefined ? <Tag color="blue">${value.toFixed(2)}</Tag> : '—',
    },
    {
      title: 'Quantity in Stock',
      dataIndex: 'quantityInStock',
      key: 'quantityInStock',
      render: (value?: number) => (value !== undefined ? value : '—'),
    },
    {
      title: 'Tracking',
      key: 'trackInventory',
      render: (_, record) => {
        const isTracking =
          record.trackInventory ?? record.quantityInStock !== undefined;
        return isTracking ? <Tag color="green">On</Tag> : 'Off';
      },
    },
  ];

  if (canWriteItems) {
    columns.push({
      title: '',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete item"
            description="Are you sure you want to delete this item?"
            onConfirm={() => onDelete(record.id!)}
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

  return columns;
};
