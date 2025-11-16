import { Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export const Bookings = () => {
  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title level={2}>Bookings & Appointments</Title>
          <Button type="primary" icon={<PlusOutlined />}>
            New Booking
          </Button>
        </div>

        <Paragraph>
          Create and manage customer bookings and appointments for services.
        </Paragraph>

        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: '8px',
          }}
        >
          <Paragraph type="secondary">
            Booking management interface coming soon...
          </Paragraph>
        </div>
      </Space>
    </div>
  );
};
