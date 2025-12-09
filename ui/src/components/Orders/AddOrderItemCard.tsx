import { Button, Card, InputNumber, Select, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

type ItemOption = {
  label: string;
  value: number;
};

type Props = {
  itemOptions: ItemOption[];
  itemToAdd?: number;
  itemQuantity: number;
  onItemToAddChange: (value?: number) => void;
  onItemQuantityChange: (value: number) => void;
  onAddItem: () => void;
  disabled?: boolean;
};

const { Text } = Typography;

export const AddOrderItemCard = ({
  itemOptions,
  itemToAdd,
  itemQuantity,
  onItemToAddChange,
  onItemQuantityChange,
  onAddItem,
  disabled,
}: Props) => (
  <Card style={{ marginBottom: 16 }}>
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Space wrap>
        <Select
          style={{ minWidth: 240 }}
          placeholder="Choose an item"
          value={itemToAdd}
          onChange={onItemToAddChange}
          options={itemOptions}
          disabled={disabled}
        />
        <InputNumber
          min={1}
          value={itemQuantity}
          onChange={(value) => onItemQuantityChange(value ?? 1)}
          disabled={disabled}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddItem}
          disabled={disabled}
        >
          Add item
        </Button>
      </Space>
      <Text type="secondary">
        Add new items to this order or adjust quantities below.
      </Text>
    </Space>
  </Card>
);
