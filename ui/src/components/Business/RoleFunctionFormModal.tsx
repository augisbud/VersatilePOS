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
            showSearch
            filterOption={(input, option) => {
              const searchValue = input.toLowerCase();
              const func = availableFunctions.find(
                (f) => f.id === option?.value
              );
              const name = func?.name?.toLowerCase() ?? '';
              const description = func?.description?.toLowerCase() ?? '';
              const action = func?.action?.toLowerCase() ?? '';
              return (
                name.includes(searchValue) ||
                description.includes(searchValue) ||
                action.includes(searchValue)
              );
            }}
          >
            {availableFunctions.map((func) => (
              <Select.Option key={func.id} value={func.id} label={func.name}>
                <div>
                  <div style={{ fontWeight: 500 }}>{func.name}</div>
                  {func.description && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        marginTop: '2px',
                      }}
                    >
                      {func.description}
                    </div>
                  )}
                  {func.action && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#1890ff',
                        marginTop: '2px',
                      }}
                    >
                      Action: {func.action}
                    </div>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
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
          tooltip="Select the permissions this role will have for this function"
        >
          <Checkbox.Group>
            <Space direction="vertical">
              {ACCESS_LEVELS.map((level) => (
                <Tooltip
                  key={level}
                  title={getAccessLevelDescription(level)}
                  placement="right"
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
