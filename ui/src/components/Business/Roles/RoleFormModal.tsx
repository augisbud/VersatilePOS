import { Modal, Form, Input, Button } from 'antd';
import { useEffect } from 'react';
import { ModelsAccountRoleDto } from '@/api/types.gen';

interface RoleFormValues {
  name: string;
}

interface RoleFormModalProps {
  open: boolean;
  editingRole: ModelsAccountRoleDto | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => void;
}

export const RoleFormModal = ({
  open,
  editingRole,
  isSubmitting,
  onClose,
  onSubmit,
}: RoleFormModalProps) => {
  const [form] = Form.useForm<RoleFormValues>();

  useEffect(() => {
    if (open) {
      if (editingRole) {
        form.setFieldsValue({ name: editingRole.name || '' });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingRole, form]);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleCancel = () => {
    onClose();
  };

  const handleFinish = (values: RoleFormValues) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={editingRole ? 'Edit Role' : 'Add New Role'}
      open={open}
      onCancel={handleCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Role Name"
          name="name"
          rules={[{ required: true, message: 'Please enter role name' }]}
        >
          <Input placeholder="Enter role name" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting} block>
            {editingRole ? 'Update Role' : 'Add Role'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
