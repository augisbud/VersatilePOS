import { Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export const Customers = () => {
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
          <Title level={2}>Customer Management</Title>
          <Button type="primary" icon={<PlusOutlined />}>
            Add Customer
          </Button>
        </div>

        <Paragraph>
          Register and manage customer information and their booking history.
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
            Customer management interface coming soon...
          </Paragraph>
        </div>
      </Space>
    </div>
  );
};
