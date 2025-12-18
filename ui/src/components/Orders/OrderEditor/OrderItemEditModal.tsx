import { useState } from 'react';
import {
  Button,
  Divider,
  Form,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  Input,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { formatPriceChange } from '@/utils/formatters';
import { ModelsasPriceModifierDto } from '@/api/types.gen';

type SelectedOption = {
  itemOptionId: number;
  count: number;
  optionName?: string;
  priceModifierValue?: number;
  priceModifierIsPercent?: boolean;
  priceModifierType?: string;
};

type AvailableOption = {
  id: number;
  name: string;
  priceLabel: string;
};

type Props = {
  open: boolean;
  itemName: string;
  basePrice: number;
  quantity: number;
  selectedOptions: SelectedOption[];
  availableOptions: AvailableOption[];
  availableDiscountOptions: AvailableOption[];
  discountPriceModifiers: ModelsasPriceModifierDto[];
  canCreateDiscountOption?: boolean;
  onCreateDiscountOption?: (payload: {
    name: string;
    priceModifierId: number;
  }) => Promise<void>;
  optionToAdd?: number;
  discountToAdd?: number;
  getOptionName: (optionId: number) => string;
  getOptionPriceLabel: (optionId: number) => string;
  onQuantityChange: (value: number) => void;
  onOptionToAddChange: (value?: number) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: number) => void;
  onDiscountToAddChange: (value?: number) => void;
  onAddDiscount: () => void;
  onRemoveDiscount: (optionId: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
};

const { Text } = Typography;

export const OrderItemEditModal = ({
  open,
  itemName,
  basePrice,
  quantity,
  selectedOptions,
  availableOptions,
  availableDiscountOptions,
  discountPriceModifiers,
  canCreateDiscountOption,
  onCreateDiscountOption,
  optionToAdd,
  discountToAdd,
  getOptionName,
  getOptionPriceLabel,
  onQuantityChange,
  onOptionToAddChange,
  onAddOption,
  onRemoveOption,
  onDiscountToAddChange,
  onAddDiscount,
  onRemoveDiscount,
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
          {selectedOptions.filter((o) => o.priceModifierType !== 'Discount')
            .length === 0 ? (
            <Text type="secondary">No options added</Text>
          ) : (
            <Space wrap style={{ marginBottom: 8 }}>
              {selectedOptions
                .filter((o) => o.priceModifierType !== 'Discount')
                .map((opt) => (
                <Tag
                  key={opt.itemOptionId}
                  closable
                  onClose={() => onRemoveOption(opt.itemOptionId)}
                  color="blue"
                >
                  {opt.optionName || getOptionName(opt.itemOptionId)}
                  {opt.optionName
                    ? (() => {
                        if (opt.priceModifierValue !== undefined) {
                          let change = opt.priceModifierValue;
                          if (opt.priceModifierIsPercent) {
                            change = (basePrice * opt.priceModifierValue) / 100;
                          }
                          if (opt.priceModifierType === 'Discount') {
                            change = -Math.abs(change);
                          }
                          return formatPriceChange(change);
                        }
                        return '';
                      })()
                    : getOptionPriceLabel(opt.itemOptionId)}
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

      <Divider style={{ margin: 0 }} />

      <div>
        <Text strong>Discounts:</Text>
        <div style={{ marginTop: 8 }}>
          {selectedOptions.filter((o) => o.priceModifierType === 'Discount')
            .length === 0 ? (
            <Text type="secondary">No discounts added</Text>
          ) : (
            <Space wrap style={{ marginBottom: 8 }}>
              {selectedOptions
                .filter((o) => o.priceModifierType === 'Discount')
                .map((opt) => (
                  <Tag
                    key={`discount-${opt.itemOptionId}`}
                    closable
                    onClose={() => onRemoveDiscount(opt.itemOptionId)}
                    color="red"
                  >
                    {opt.optionName || getOptionName(opt.itemOptionId)}
                    {opt.optionName
                      ? (() => {
                          if (opt.priceModifierValue !== undefined) {
                            let change = opt.priceModifierValue;
                            if (opt.priceModifierIsPercent) {
                              change =
                                (basePrice * opt.priceModifierValue) / 100;
                            }
                            change = -Math.abs(change);
                            return formatPriceChange(change);
                          }
                          return '';
                        })()
                      : getOptionPriceLabel(opt.itemOptionId)}
                    {opt.count > 1 ? ` x${opt.count}` : ''}
                  </Tag>
                ))}
            </Space>
          )}
        </div>

        {availableDiscountOptions.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Select
              placeholder="Select discount to add"
              value={discountToAdd}
              onChange={onDiscountToAddChange}
              style={{ flex: 1 }}
              options={availableDiscountOptions.map((opt) => ({
                label: `${opt.name}${opt.priceLabel}`,
                value: opt.id,
              }))}
            />
            <Button
              icon={<PlusOutlined />}
              onClick={onAddDiscount}
              disabled={!discountToAdd}
            >
              Add
            </Button>
          </div>
        )}

        {availableDiscountOptions.length === 0 &&
          selectedOptions.filter((o) => o.priceModifierType === 'Discount')
            .length === 0 && (
            <>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                No discounts available for this item.
              </Text>

              {canCreateDiscountOption && onCreateDiscountOption && (
                <CreateDiscountOptionInlineForm
                  discountPriceModifiers={discountPriceModifiers}
                  onCreate={onCreateDiscountOption}
                />
              )}
            </>
          )}
      </div>
    </div>
  </Modal>
);

const CreateDiscountOptionInlineForm = ({
  discountPriceModifiers,
  onCreate,
}: {
  discountPriceModifiers: ModelsasPriceModifierDto[];
  onCreate: (payload: { name: string; priceModifierId: number }) => Promise<void>;
}) => {
  const [form] = Form.useForm<{ priceModifierId: number; name: string }>();
  const [submitting, setSubmitting] = useState(false);

  const discountOptions = discountPriceModifiers
    .filter((pm) => pm.id !== undefined)
    .map((pm) => ({
      value: pm.id!,
      label: `${pm.name} (${pm.isPercentage ? `${pm.value}%` : `$${pm.value?.toFixed(2)}`})`,
    }));

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      await onCreate(values);
      form.resetFields();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 12,
        border: '1px dashed #d9d9d9',
        borderRadius: 6,
        padding: 12,
        background: '#fafafa',
      }}
    >
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        Create a discount option for this item
      </Text>
      <Form form={form} layout="vertical" size="middle">
        <Form.Item
          name="priceModifierId"
          label="Discount"
          rules={[{ required: true, message: 'Select a discount' }]}
        >
          <Select
            placeholder="Select discount price modifier"
            options={discountOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="Option name"
          rules={[{ required: true, message: 'Enter a name' }]}
        >
          <Input placeholder="e.g., Staff Discount, Promo Discount" />
        </Form.Item>
        <Button type="primary" onClick={() => void handleSubmit()} loading={submitting}>
          Create & Apply
        </Button>
      </Form>
    </div>
  );
};
