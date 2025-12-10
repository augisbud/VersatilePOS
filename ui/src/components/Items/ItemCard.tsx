import { Card, Popconfirm } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { ModelsItemDto } from '@/api/types.gen';
import { formatCurrency } from '@/utils/formatters';

type Props = {
  item: ModelsItemDto;
  loading?: boolean;
  canWriteItems: boolean;
  onEdit: (item: ModelsItemDto) => void;
  onDelete: (itemId: number) => void;
  onPreview: (item: ModelsItemDto) => void;
};

const { Meta } = Card;

export const ItemCard = ({
  item,
  loading,
  canWriteItems,
  onEdit,
  onDelete,
  onPreview,
}: Props) => {
  const actions = [
    <EyeOutlined key="preview" onClick={() => onPreview(item)} />,
  ];

  if (canWriteItems) {
    actions.push(
      <EditOutlined key="edit" onClick={() => onEdit(item)} />,
      <Popconfirm
        key="delete"
        title="Delete item"
        description="Are you sure you want to delete this item?"
        onConfirm={() => item.id && onDelete(item.id)}
        okText="Yes"
        cancelText="No"
      >
        <DeleteOutlined />
      </Popconfirm>
    );
  }

  return (
    <Card
      loading={loading}
      cover={
        <div
          style={{
            height: 120,
            background: '#e8e8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShoppingOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
        </div>
      }
      actions={actions}
    >
      <Meta
        title={item.name || `Item #${item.id}`}
        description={
          <>
            {formatCurrency(item.price)}
            {item.quantityInStock !== undefined &&
              item.quantityInStock !== null &&
              ` · ${item.quantityInStock} in stock`}
          </>
        }
      />
    </Card>
  );
};
