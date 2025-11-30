import { Modal, Form, Select, Checkbox, Space, Button, Tooltip } from 'antd';
import { useEffect } from 'react';
import {
  ModelsAccountRoleDto,
  ModelsFunctionDto,
  ConstantsAccessLevel,
} from '@/api/types.gen';
import {
  ACCESS_LEVELS,
  getAccessLevelDescription,
} from '@/constants/accessLevels';

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

  const handleAccessLevelChange = (checkedValues: string[]) => {
    const levels = checkedValues as ConstantsAccessLevel[];

    if (levels.includes('Write') && !levels.includes('Read')) {
      const updatedLevels: ConstantsAccessLevel[] = [...levels, 'Read'];

      form.setFieldsValue({ accessLevels: updatedLevels });
    } else {
      form.setFieldsValue({ accessLevels: levels });
    }
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
              label: `${func.name} - ${func.description}`,
              value: func.id,
            }))}
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
          tooltip="Select the permissions this role will have for this function. Write permission automatically includes Read."
        >
          <Checkbox.Group onChange={handleAccessLevelChange}>
            <Space direction="vertical">
              {ACCESS_LEVELS.map((level) => (
                <Tooltip
                  key={level}
                  title={getAccessLevelDescription(level)}
                  placement="left"
                >
                  <Checkbox value={level}>{level}</Checkbox>
                </Tooltip>
              ))}
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
