import { Modal, Form, Input, InputNumber } from 'antd';

export interface GiftCardFormValues {
  code: string;
  initialValue: number;
}

interface GiftCardFormModalProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: GiftCardFormValues) => void;
}

export const GiftCardFormModal = ({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: GiftCardFormModalProps) => {
  const [form] = Form.useForm<GiftCardFormValues>();

  const handleAfterOpenChange = (visible: boolean) => {
    if (!visible) {
      form.resetFields();
    }
  };

  const handleSubmit = () => {
    void form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GC-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldValue('code', code);
  };

  return (
    <Modal
      title="Create New Gift Card"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={isSubmitting}
      afterOpenChange={handleAfterOpenChange}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="code"
          label="Gift Card Code"
          rules={[
            { required: true, message: 'Please enter a gift card code' },
            { min: 4, message: 'Code must be at least 4 characters' },
          ]}
          extra={
            <a onClick={generateCode} style={{ fontSize: 12 }}>
              Generate random code
            </a>
          }
        >
          <Input
            placeholder="Enter gift card code (e.g., GC-ABC12345)"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item
          name="initialValue"
          label="Initial Value"
          rules={[
            { required: true, message: 'Please enter an initial value' },
            {
              type: 'number',
              min: 0.01,
              message: 'Value must be at least $0.01',
            },
          ]}
        >
          <InputNumber
            placeholder="Enter initial value"
            min={1}
            precision={2}
            style={{ width: '100%' }}
            prefix="$"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
