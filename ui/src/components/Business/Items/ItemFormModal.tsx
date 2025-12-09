import { Modal, Form, Input, InputNumber, Switch } from 'antd';
import { useEffect } from 'react';
import { ModelsItemDto } from '@/api/types.gen';

export interface ItemFormValues {
  name: string;
  price: number;
  quantityInStock?: number;
  trackInventory?: boolean;
}

export type ItemWithInventory = ModelsItemDto & { trackInventory?: boolean };

interface ItemFormModalProps {
  open: boolean;
  editingItem: ItemWithInventory | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ItemFormValues) => void;
}

export const ItemFormModal = ({
  open,
  editingItem,
  isSubmitting,
  onClose,
  onSubmit,
}: ItemFormModalProps) => {
  const [form] = Form.useForm<ItemFormValues>();
  const trackInventory = Form.useWatch('trackInventory', form);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        form.setFieldsValue({
          name: editingItem.name ?? '',
          price: editingItem.price ?? 0,
          quantityInStock: editingItem.quantityInStock,
          trackInventory:
            editingItem.trackInventory ?? Boolean(editingItem.quantityInStock),
        });
      } else {
        form.resetFields();
      }
    }
  }, [editingItem, open, form]);

  useEffect(() => {
    if (!trackInventory) {
      form.setFieldsValue({ quantityInStock: undefined });
    }
  }, [trackInventory, form]);

  const handleSubmit = () => {
    void form.validateFields().then((values) => {
      const quantityInStock =
        values.quantityInStock === null || values.quantityInStock === undefined
          ? undefined
          : values.quantityInStock;

      onSubmit({
        name: values.name,
        price: values.price,
        quantityInStock,
        trackInventory: trackInventory ?? false,
      });
    });
  };

  return (
    <Modal
      title={editingItem ? 'Edit Item' : 'Add Item'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      okText={editingItem ? 'Save Changes' : 'Create Item'}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Please enter item name',
            },
            { min: 2, message: 'Name should be at least 2 characters' },
            { max: 100, message: 'Name is too long' },
          ]}
        >
          <Input placeholder="Item name" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price"
          rules={[
            { required: true, message: 'Please enter item price' },
            {
              type: 'number',
              min: 0.01,
              message: 'Price must be greater than 0',
            },
          ]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            prefix="$"
          />
        </Form.Item>

        <Form.Item
          name="trackInventory"
          label="Track inventory"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="quantityInStock"
          label="Quantity in stock"
          rules={[
            {
              type: 'number',
              min: 0,
              message: 'Quantity must be zero or greater',
            },
            {
              validator: (_, value) => {
                if (!trackInventory) return Promise.resolve();
                if (value === null || value === undefined) {
                  return Promise.reject(
                    new Error('Quantity is required when tracking inventory')
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          hidden={!trackInventory}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
