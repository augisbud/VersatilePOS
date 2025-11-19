import { PageLayout } from '@/layouts/PageLayout';
import { Typography, Card } from 'antd';
import { useState } from 'react';
import {
  RegisterForm,
  RegisterFormValues,
} from '@/components/Auth/RegisterForm';

const { Title } = Typography;

export const Register = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: RegisterFormValues) => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log(values);
    }, 1000);
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
