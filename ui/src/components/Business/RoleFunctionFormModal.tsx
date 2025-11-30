import { Modal, Form, Select, Checkbox, Space, Button } from 'antd';
import { useEffect } from 'react';
import {
  ModelsAccountRoleDto,
  ModelsFunctionDto,
  ConstantsAccessLevel,
} from '@/api/types.gen';

interface FunctionFormValues {
  functionId: number;
  accessLevels: ConstantsAccessLevel[];
}

interface RoleFunctionFormModalProps {
  open: boolean;
  managingRole: ModelsAccountRoleDto | null;
  availableFunctions: ModelsFunctionDto[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: FunctionFormValues) => void;
}

export const RoleFunctionFormModal = ({
  open,
  managingRole,
  availableFunctions,
  isSubmitting,
  onClose,
  onSubmit,
}: RoleFunctionFormModalProps) => {
  const [form] = Form.useForm<FunctionFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleCancel = () => {
    onClose();
  };

  const handleFinish = (values: FunctionFormValues) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={`Add Function to ${managingRole?.name || 'Role'}`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Function"
          name="functionId"
          rules={[{ required: true, message: 'Please select a function' }]}
        >
          <Select
            placeholder="Select a function"
            options={availableFunctions.map((func) => ({
              label: func.name,
              value: func.id,
            }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Access Levels"
          name="accessLevels"
          rules={[
            {
              required: true,
              message: 'Please select at least one access level',
            },
          ]}
        >
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="Read">Read</Checkbox>
              <Checkbox value="Write">Write</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting} block>
            Assign Function
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
