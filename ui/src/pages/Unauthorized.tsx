import { Typography } from 'antd';
import { PageLayout } from '@/layouts/PageLayout';

const { Title, Paragraph } = Typography;

export const Unauthorized = () => {
  return (
    <PageLayout>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Title level={1}>403</Title>
        <Paragraph>You don't have permission to access this page</Paragraph>
      </div>
    </PageLayout>
  );
};
