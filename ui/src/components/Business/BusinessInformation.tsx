import { Card, Space, Typography, Descriptions } from 'antd';
import {
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { ModelsBusinessDto } from '@/api/types.gen';

const { Title, Text } = Typography;

interface BusinessInformationProps {
  business?: ModelsBusinessDto;
}

export const BusinessInformation = ({ business }: BusinessInformationProps) => {
  return (
    <Card
      title={
        <Space>
          <ShopOutlined />
          <Title level={3} style={{ margin: 0 }}>
            Business Information
          </Title>
        </Space>
      }
    >
      {business ? (
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item
            label={
              <Space>
                <ShopOutlined />
                <Text strong>Business Name</Text>
              </Space>
            }
          >
            <Text>{business.name}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <MailOutlined />
                <Text strong>Email</Text>
              </Space>
            }
          >
            <Text copyable>{business.email}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <PhoneOutlined />
                <Text strong>Phone</Text>
              </Space>
            }
          >
            <Text copyable>{business.phone}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <EnvironmentOutlined />
                <Text strong>Address</Text>
              </Space>
            }
          >
            <Text>{business.address}</Text>
          </Descriptions.Item>
        </Descriptions>
      ) : null}
    </Card>
  );
};
