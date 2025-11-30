import { PageLayout } from '@/layouts/PageLayout';
import { Typography, Card } from 'antd';
import { useEffect, useState } from 'react';
import { LoginForm, LoginFormValues } from '@/components/Auth/LoginForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const { Title } = Typography;

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      await login({
        username: values.username,
        password: values.password,
      });

      void navigate('/');
    } finally {
      setLoading(false);
    }
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
          <Title level={2}>Login</Title>
        </div>

        <LoginForm onFinish={onFinish} loading={loading} />
      </Card>
    </PageLayout>
  );
};
