import { Form, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FormField } from '@/types/form';

export const Username = () => (
  <Form.Item
    label="Username"
    name={FormField.USERNAME}
    rules={[
      {
        required: true,
        message: 'Please input your username!',
      },
      {
        min: 3,
        message: 'Username must be at least 3 characters long',
      },
      {
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Username can only contain letters, numbers, and underscores',
      },
    ]}
  >
    <Input prefix={<UserOutlined />} placeholder="Choose a username" />
  </Form.Item>
);
