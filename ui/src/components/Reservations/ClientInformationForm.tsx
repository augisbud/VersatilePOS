import { Form, Input } from 'antd';
import { FormInstance } from 'antd/es/form';
import { ClientFormValues } from './types';

interface ClientInformationFormProps {
  form: FormInstance<ClientFormValues>;
}

export const ClientInformationForm = ({ form }: ClientInformationFormProps) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please enter name' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Surname"
        name="surname"
        rules={[{ required: true, message: 'Please enter surname' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Phone number"
        name="phoneNumber"
        rules={[{ required: true, message: 'Please enter phone number' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Email" name="email">
        <Input type="email" />
      </Form.Item>
    </Form>
  );
};
