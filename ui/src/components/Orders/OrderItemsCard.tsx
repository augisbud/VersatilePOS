import { Button, Card, InputNumber, Select, Space, Typography } from 'antd';

type ItemOption = {
  label: string;
  value: number;
};

type SelectedItem = {
  itemId: number;
  count: number;
};

type Props = {
  itemOptions: ItemOption[];
  selectedItems: SelectedItem[];
  itemToAdd?: number;
  itemQuantity: number;
  onItemToAddChange: (value?: number) => void;
  onItemQuantityChange: (value: number) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: number) => void;
  loading?: boolean;
  disabled?: boolean;
};

const { Text } = Typography;

export const OrderItemsCard = ({
  itemOptions,
  selectedItems,
  itemToAdd,
  itemQuantity,
  onItemToAddChange,
  onItemQuantityChange,
  onAddItem,
  onRemoveItem,
  loading,
  disabled,
}: Props) => (
  <Card title="Items" size="small" style={{ marginTop: 12 }} loading={loading}>
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Space wrap>
        <Select
          style={{ minWidth: 260 }}
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
        <Button type="primary" onClick={onAddItem} disabled={disabled}>
          Add
        </Button>
      </Space>

      {selectedItems.length === 0 ? (
        <Text type="secondary">No items selected yet.</Text>
      ) : (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {selectedItems.map((item) => {
            const itemName =
              itemOptions.find((opt) => opt.value === item.itemId)?.label ??
              `Item #${item.itemId}`;
            return (
              <li key={item.itemId} style={{ marginBottom: 4 }}>
                <Space>
                  <Text>
                    {itemName} — Qty: {item.count}
                  </Text>
                  <Button
                    type="link"
                    danger
                    onClick={() => onRemoveItem(item.itemId)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Space>
              </li>
            );
          })}
        </ul>
      )}
    </Space>
  </Card>
);
