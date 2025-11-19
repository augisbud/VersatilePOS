import { UserOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import { FormField } from '@/types/form';

export const Name = () => (
  <Form.Item
    label="Name"
    name={FormField.NAME}
    rules={[
      {
        required: true,
        message: 'Please input your name!',
      },
      {
        min: 2,
        message: 'Name must be at least 2 characters long',
      },
    ]}
  >
    <Input prefix={<UserOutlined />} placeholder="Enter your full name" />
  </Form.Item>
);
