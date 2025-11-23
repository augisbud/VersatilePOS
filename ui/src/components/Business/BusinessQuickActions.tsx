import { Card, Space, Typography, Button } from 'antd';

const { Title, Text } = Typography;

export const BusinessQuickActions = () => {
  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Quick Actions
        </Title>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary">
          More business management features coming soon!
        </Text>
        <Space wrap>
          <Button disabled>Manage Employees</Button>
          <Button disabled>Business Settings</Button>
          <Button disabled>Reports & Analytics</Button>
        </Space>
      </Space>
    </Card>
  );
};

