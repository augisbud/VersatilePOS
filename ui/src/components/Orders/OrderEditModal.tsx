import { Form, Input, InputNumber, Modal, Select } from 'antd';
import type { FormInstance } from 'antd';

const ORDER_STATUS_OPTIONS = ['Pending', 'Completed', 'Cancelled'];

type Props = {
  open: boolean;
  form: FormInstance;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export const OrderEditModal = ({ open, form, loading, onCancel, onSubmit }: Props) => (
  <Modal
    open={open}
    onCancel={onCancel}
    onOk={onSubmit}
    title="Edit Order"
    okText="Save"
    confirmLoading={loading}
    destroyOnClose
  >
    <Form layout="vertical" form={form}>
      <Form.Item label="Customer name" name="customer">
        <Input placeholder="Optional" />
      </Form.Item>
      <Form.Item label="Customer email" name="customerEmail">
        <Input type="email" placeholder="Optional" />
      </Form.Item>
      <Form.Item label="Customer phone" name="customerPhone">
        <Input placeholder="Optional" />
      </Form.Item>
      <Form.Item label="Status" name="status">
        <Select
          placeholder="Select status"
          allowClear
          options={ORDER_STATUS_OPTIONS.map((status) => ({
            label: status,
            value: status,
          }))}
        />
      </Form.Item>
      <Form.Item label="Service charge" name="serviceCharge">
        <InputNumber min={0} step={0.01} prefix="$" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Tip amount" name="tipAmount">
        <InputNumber min={0} step={0.01} prefix="$" style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  </Modal>
);
