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
  onFinish: (values: RegisterFormValues) => Promise<void>;
  loading: boolean;
  showFooter?: boolean;
  buttonLabel?: string;
}

export const RegisterForm = ({
  onFinish,
  loading,
  showFooter = true,
  buttonLabel = 'Register',
}: RegisterFormProps) => {
  const [form] = Form.useForm();

  const handleFinish = (values: RegisterFormValues) => {
    void onFinish(values);
  };

  return (
    <Form
      form={form}
      name="register"
      onFinish={handleFinish}
      layout="vertical"
      size="large"
      scrollToFirstError
    >
      <Name />
      <Username />
      <Password />
      <ConfirmPassword />

      <SubmitButton label={buttonLabel} loading={loading} />

      {showFooter && <FormFooter state="register" />}
    </Form>
  );
};
