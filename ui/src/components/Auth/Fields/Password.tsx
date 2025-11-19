import { Form, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { FormField } from '@/types/form';

export const Password = () => (
  <Form.Item
    label="Password"
    name={FormField.PASSWORD}
    rules={[
      {
        required: true,
        message: 'Please input your password!',
      },
      {
        min: 6,
        message: 'Password must be at least 6 characters long',
      },
    ]}
  >
    <Input.Password
      prefix={<LockOutlined />}
      placeholder="Enter your password"
    />
  </Form.Item>
);
