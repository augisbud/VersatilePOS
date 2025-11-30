import { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import {
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { ModelsCreateBusinessRequest } from '@/api/types.gen';

interface BusinessCreationFormProps {
  loading?: boolean;
  error?: string;
  onSubmit: (values: ModelsCreateBusinessRequest) => Promise<void>;
}

export const BusinessCreationForm = ({
  loading = false,
  error,
  onSubmit,
}: BusinessCreationFormProps) => {
  const [form] = Form.useForm();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleSubmit = async (values: ModelsCreateBusinessRequest) => {
    setSubmitError(undefined);
    try {
      await onSubmit(values);
      form.resetFields();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to create business'
      );
    }
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          void handleSubmit(values as ModelsCreateBusinessRequest);
        }}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          label="Business Name"
          name="name"
          rules={[
            {
              required: true,
              message: 'Please enter your business name',
            },
            {
              min: 2,
              message: 'Business name must be at least 2 characters',
            },
          ]}
        >
          <Input
            prefix={<ShopOutlined />}
            placeholder="e.g., Joe's Coffee Shop"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter business email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="business@example.com" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            {
              required: true,
              message: 'Please enter business phone number',
            },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="+1 (555) 123-4567" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[
            {
              required: true,
              message: 'Please enter business address',
            },
          ]}
        >
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="123 Main St, City, State, ZIP"
          />
        </Form.Item>

        <Form.Item
          style={{ marginTop: 32, marginBottom: 0, textAlign: 'right' }}
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<ShopOutlined />}
          >
            Create Business
          </Button>
        </Form.Item>
      </Form>

      {(error || submitError) && (
        <Alert
          message="Error"
          description={error || submitError}
          type="error"
          showIcon
          closable
          style={{ marginTop: 16 }}
          onClose={() => setSubmitError(undefined)}
        />
      )}
    </>
  );
};
