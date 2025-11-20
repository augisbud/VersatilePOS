import { PageLayout } from '@/layouts/PageLayout';
import { Typography, Card } from 'antd';
import { useEffect, useState } from 'react';
import {
  RegisterForm,
  RegisterFormValues,
} from '@/components/Auth/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const { Title } = Typography;

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, login, isAuthenticated } = useAuth();

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);

    await register({
      name: values.name,
      username: values.username,
      password: values.password,
    });

    await login({
      username: values.username,
      password: values.password,
    });

    void navigate('/');

    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      void navigate('/');
    }
  }, [isAuthenticated]);

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
