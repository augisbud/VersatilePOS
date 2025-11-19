import { Form, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { FormField } from '@/types/form';

export const ConfirmPassword = () => (
  <Form.Item
    label="Confirm Password"
    name={FormField.CONFIRM_PASSWORD}
    dependencies={[FormField.PASSWORD]}
    rules={[
      {
        required: true,
        message: 'Please confirm your password!',
      },
      ({ getFieldValue }) => ({
        validator(_, value) {
          if (!value || getFieldValue(FormField.PASSWORD) === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('The two passwords do not match!'));
        },
      }),
    ]}
  >
    <Input.Password
      prefix={<LockOutlined />}
      placeholder="Confirm your password"
    />
  </Form.Item>
);
