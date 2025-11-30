import { Modal, Form, Select, Button } from 'antd';
import { useEffect } from 'react';
import { ModelsAccountDto, ModelsAccountRoleDto } from '@/api/types.gen';

interface RoleAssignFormValues {
  roleId: number;
}

interface EmployeeRoleFormModalProps {
  open: boolean;
  employee: ModelsAccountDto | null;
  availableRoles: ModelsAccountRoleDto[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: RoleAssignFormValues) => void;
}

export const EmployeeRoleFormModal = ({
  open,
  employee,
  availableRoles,
  isSubmitting,
  onClose,
  onSubmit,
}: EmployeeRoleFormModalProps) => {
  const [form] = Form.useForm<RoleAssignFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleCancel = () => {
    onClose();
  };

  const handleFinish = (values: RoleAssignFormValues) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={`Assign Role to ${employee?.name || 'Employee'}`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Role"
          name="roleId"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select
            placeholder="Select a role"
            options={availableRoles.map((role) => ({
              label: role.name,
              value: role.id,
            }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting} block>
            Assign Role
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
