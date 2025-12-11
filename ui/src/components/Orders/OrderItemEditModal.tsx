import {
  Button,
  Divider,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

type SelectedOption = {
  itemOptionId: number;
  count: number;
};

type AvailableOption = {
  id: number;
  name: string;
  priceLabel: string;
};

type Props = {
  open: boolean;
  itemName: string;
  quantity: number;
  selectedOptions: SelectedOption[];
  availableOptions: AvailableOption[];
  optionToAdd?: number;
  getOptionName: (optionId: number) => string;
  getOptionPriceLabel: (optionId: number) => string;
  onQuantityChange: (value: number) => void;
  onOptionToAddChange: (value?: number) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
};

const { Text } = Typography;

export const OrderItemEditModal = ({
  open,
  itemName,
  quantity,
  selectedOptions,
  availableOptions,
  optionToAdd,
  getOptionName,
  getOptionPriceLabel,
  onQuantityChange,
  onOptionToAddChange,
  onAddOption,
  onRemoveOption,
  onSave,
  onCancel,
  onRemove,
}: Props) => (
  <Modal
    title={`Edit ${itemName}`}
    open={open}
    onOk={onSave}
    onCancel={onCancel}
    footer={[
      <Button key="remove" danger onClick={onRemove}>
        Remove
      </Button>,
      <Button key="cancel" onClick={onCancel}>
        Cancel
      </Button>,
      <Button key="save" type="primary" onClick={onSave}>
        Save
      </Button>,
    ]}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <Text strong>Quantity:</Text>
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => onQuantityChange(value || 1)}
          style={{ width: '100%', marginTop: 8 }}
        />
      </div>

      <Divider style={{ margin: 0 }} />

      <div>
        <Text strong>Options:</Text>
        <div style={{ marginTop: 8 }}>
          {selectedOptions.length === 0 ? (
            <Text type="secondary">No options added</Text>
          ) : (
            <Space wrap style={{ marginBottom: 8 }}>
              {selectedOptions.map((opt) => (
                <Tag
                  key={opt.itemOptionId}
                  closable
                  onClose={() => onRemoveOption(opt.itemOptionId)}
                  color="blue"
                >
                  {getOptionName(opt.itemOptionId)}
                  {getOptionPriceLabel(opt.itemOptionId)}
                  {opt.count > 1 ? ` x${opt.count}` : ''}
                </Tag>
              ))}
            </Space>
          )}
        </div>

        {availableOptions.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Select
              placeholder="Select option to add"
              value={optionToAdd}
              onChange={onOptionToAddChange}
              style={{ flex: 1 }}
              options={availableOptions.map((opt) => ({
                label: `${opt.name}${opt.priceLabel}`,
                value: opt.id,
              }))}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={onAddOption}
              disabled={!optionToAdd}
            >
              Add
            </Button>
          </div>
        )}

        {availableOptions.length === 0 && selectedOptions.length === 0 && (
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            No options available for this item
          </Text>
        )}
      </div>
    </div>
  </Modal>
);

