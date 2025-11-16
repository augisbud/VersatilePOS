import { Card, Row, Col, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const Dashboard = () => {
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Paragraph>
        Welcome to VersatilePOS - Your all-in-one solution for restaurants and
        beauty salons
      </Paragraph>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Today's Bookings" bordered={false}>
            <Paragraph>Content coming soon...</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Active Customers" bordered={false}>
            <Paragraph>Content coming soon...</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Revenue" bordered={false}>
            <Paragraph>Content coming soon...</Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
