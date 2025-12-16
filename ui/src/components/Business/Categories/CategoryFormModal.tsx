import { Modal, Form, Input } from 'antd';
import { useEffect } from 'react';

interface CategoryFormValues {
  value: string;
}

interface CategoryFormModalProps {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
}

export const CategoryFormModal = ({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: CategoryFormModalProps) => {
  const [form] = Form.useForm<CategoryFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title="Add Category"
      open={open}
      onCancel={onClose}
      okText="Create"
      okButtonProps={{ loading: isSubmitting }}
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          label="Category name"
          name="value"
          rules={[{ required: true, message: 'Please enter a category name' }]}
        >
          <Input placeholder="e.g. Drinks" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
