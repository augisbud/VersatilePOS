import {
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Button,
  Checkbox,
} from 'antd';
import { ModelsasPriceModifierDto } from '@/api/types.gen';
import { getPriceModifierSelectOptions } from '@/utils/formatters';

export type NewOptionFormValues = {
  name: string;
  priceModifierId: number;
  quantityInStock?: number;
  trackInventory?: boolean;
};

type Props = {
  priceModifiers: ModelsasPriceModifierDto[];
  isEditing: boolean;
  allowedModifierTypes?: string[];
  excludedModifierTypes?: string[];
  onSubmit: (values: NewOptionFormValues) => void;
  onCancel: () => void;
};

export const ItemOptionInlineForm = ({
  priceModifiers,
  isEditing,
  allowedModifierTypes,
  excludedModifierTypes,
  onSubmit,
  onCancel,
}: Props) => {
  const [form] = Form.useForm<NewOptionFormValues>();
  const trackInventory = Form.useWatch('trackInventory', form);

  const filteredPriceModifiers = priceModifiers.filter((pm) => {
    if (allowedModifierTypes?.length && !allowedModifierTypes.includes(pm.modifierType ?? '')) {
      return false;
    }
    if (excludedModifierTypes?.length && excludedModifierTypes.includes(pm.modifierType ?? '')) {
      return false;
    }
    return true;
  });

  const priceModifierOptions = getPriceModifierSelectOptions(filteredPriceModifiers);

  const handleSubmit = () => {
    void form.validateFields().then((values) => {
      onSubmit(values);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <div
      style={{
        border: '1px dashed #d9d9d9',
        borderRadius: 6,
        padding: 12,
        background: '#fafafa',
      }}
    >
      <Form form={form} layout="vertical" size="middle">
        <Form.Item
          name="name"
          label="Option Name"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="e.g., Large, Extra Cheese" />
        </Form.Item>
        <Form.Item
          name="priceModifierId"
          label="Price Modifier"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select
            placeholder="Select price modifier"
            options={priceModifierOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item name="trackInventory" valuePropName="checked">
          <Checkbox>Track Inventory</Checkbox>
        </Form.Item>
        {trackInventory && (
          <Form.Item
            name="quantityInStock"
            label="Quantity in Stock"
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber
              min={0}
              placeholder="Enter quantity"
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
        <Space>
          <Button type="primary" size="small" onClick={handleSubmit}>
            {isEditing ? 'Create Option' : 'Add to List'}
          </Button>
          <Button size="small" onClick={handleCancel}>
            Cancel
          </Button>
        </Space>
      </Form>
    </div>
  );
};
