import { Form, Input, InputNumber, Modal } from 'antd';
import type { FormInstance } from 'antd';
import { ModelsItemDto } from '@/api/types.gen';

type Props = {
  open: boolean;
  form: FormInstance;
  editingItem: ModelsItemDto | null;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export const ItemModal = ({
  open,
  form,
  editingItem,
  confirmLoading,
  onCancel,
  onSubmit,
}: Props) => (
  <Modal
    open={open}
    onCancel={onCancel}
    onOk={onSubmit}
    confirmLoading={confirmLoading}
    title={editingItem ? 'Edit Item' : 'New Item'}
    okText={editingItem ? 'Save Changes' : 'Create Item'}
    destroyOnClose
  >
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please enter item name' }]}
      >
        <Input placeholder="Item name" />
      </Form.Item>

      <Form.Item
        name="price"
        label="Price"
        rules={[{ required: true, message: 'Please enter item price' }]}
      >
        <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
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
        ]}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  </Modal>
);
