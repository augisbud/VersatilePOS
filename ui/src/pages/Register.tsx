import { PageLayout } from '@/layouts/PageLayout';
import { Typography, Card } from 'antd';
import { useState } from 'react';
import {
  RegisterForm,
  RegisterFormValues,
} from '@/components/Auth/RegisterForm';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { createAccount } from '@/actions/user';

const { Title } = Typography;

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      await dispatch(
        createAccount({
          name: values.name,
          username: values.username,
          password: values.password,
        })
      ).unwrap();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Card
        style={{
          width: '30%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>Register Account</Title>
        </div>
        <RegisterForm onFinish={onFinish} loading={loading} />
      </Card>
    </PageLayout>
  );
};
