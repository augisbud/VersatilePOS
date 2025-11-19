import { Typography } from 'antd';
import { PageLayout } from '@/layouts/PageLayout';

const { Title, Paragraph } = Typography;

export const NotFound = () => {
  return (
    <PageLayout>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Title level={1}>404</Title>
        <Paragraph>Page not found</Paragraph>
      </div>
    </PageLayout>
  );
};
