import { Form } from 'antd';
import { Name, Username, Password, ConfirmPassword } from './Fields';
import { SubmitButton } from './Fields/SubmitButton';
import { FormFooter } from './FormFooter';

export interface RegisterFormValues {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onFinish: (values: RegisterFormValues) => void;
  loading: boolean;
}

export const RegisterForm = ({ onFinish, loading }: RegisterFormProps) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      name="register"
      onFinish={onFinish}
      layout="vertical"
      size="large"
      scrollToFirstError
    >
      <Name />
      <Username />
      <Password />
      <ConfirmPassword />

      <SubmitButton label="Register" loading={loading} />

      <FormFooter state="register" />
    </Form>
  );
};
