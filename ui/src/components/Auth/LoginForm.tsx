import { Form } from 'antd';
import { Username, Password } from './Fields';
import { SubmitButton } from './Fields/SubmitButton';
import { FormFooter } from './FormFooter';

export interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginFormProps {
  onFinish: (values: LoginFormValues) => Promise<void>;
  loading: boolean;
}

export const LoginForm = ({ onFinish, loading }: LoginFormProps) => {
  const [form] = Form.useForm();

  const handleFinish = (values: LoginFormValues) => {
    void onFinish(values);
  };

  return (
    <Form
      form={form}
      name="login"
      onFinish={handleFinish}
      layout="vertical"
      size="large"
      scrollToFirstError
    >
      <Username />
      <Password />

      <SubmitButton label="Login" loading={loading} />

      <FormFooter state="login" />
    </Form>
  );
};
