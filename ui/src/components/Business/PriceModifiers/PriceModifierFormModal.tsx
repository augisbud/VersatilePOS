import { Modal, Form, Input, InputNumber, Select, Switch, Space } from 'antd';
import { ModelsasPriceModifierDto } from '@/api/types.gen';

export interface PriceModifierFormValues {
  name: string;
  modifierType: string;
  value: number;
  isPercentage?: boolean;
}

export interface PriceModifierDefaultValues {
  name?: string;
  modifierType?: string;
  value?: number;
  isPercentage?: boolean;
}

interface PriceModifierFormModalProps {
  open: boolean;
  editingModifier: ModelsasPriceModifierDto | null;
  isSubmitting: boolean;
  defaultValues?: PriceModifierDefaultValues;
  onClose: () => void;
  onSubmit: (values: PriceModifierFormValues) => void;
}

const MODIFIER_TYPES = [
  { value: 'Discount', label: 'Discount' },
  { value: 'Surcharge', label: 'Surcharge' },
];

const MODIFIER_TYPES_WITH_TAX = [
  ...MODIFIER_TYPES,
  { value: 'Tax', label: 'Tax' },
];

export const PriceModifierFormModal = ({
  open,
  editingModifier,
  isSubmitting,
  defaultValues,
  onClose,
  onSubmit,
}: PriceModifierFormModalProps) => {
  const [form] = Form.useForm<PriceModifierFormValues>();
  const isPercentage = Form.useWatch('isPercentage', form);
  const modifierType = Form.useWatch('modifierType', form);

  const handleAfterOpenChange = (visible: boolean) => {
    if (visible) {
      if (editingModifier) {
        form.setFieldsValue({
          name: editingModifier.name,
          modifierType: editingModifier.modifierType,
          value: editingModifier.value,
          isPercentage: editingModifier.isPercentage,
        });
      } else if (defaultValues) {
        form.setFieldsValue(defaultValues);
      }
    }
  };

  const handleSubmit = () => {
    void form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  return (
    <Modal
      title={editingModifier ? 'Edit Price Modifier' : 'Add New Price Modifier'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      afterOpenChange={handleAfterOpenChange}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please enter price modifier name' },
          ]}
        >
          <Input placeholder="Enter price modifier name" />
        </Form.Item>

        <Form.Item
          name="modifierType"
          label="Type"
          rules={[{ required: true, message: 'Please select modifier type' }]}
        >
          <Select
            placeholder="Select modifier type"
            options={
              modifierType === 'Tax' ? MODIFIER_TYPES_WITH_TAX : MODIFIER_TYPES
            }
            disabled={modifierType === 'Tax'}
          />
        </Form.Item>

        <Form.Item label="Value" required>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item
              name="value"
              noStyle
              rules={[{ required: true, message: 'Please enter value' }]}
            >
              <InputNumber
                placeholder="Enter value"
                min={0}
                precision={2}
                style={{ width: '100%' }}
                prefix={isPercentage ? undefined : '$'}
                suffix={isPercentage ? '%' : undefined}
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="isPercentage"
          label="Percentage Based"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};
