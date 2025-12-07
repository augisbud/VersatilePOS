import { Card, Space, Typography } from 'antd';
import { ServiceItem } from './types';

const { Text } = Typography;

interface ServiceCardProps {
  service: ServiceItem;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <Card size="small" style={{ width: '100%' }}>
      <Space direction="vertical" size={0}>
        <Text>
          <Text strong>Service:</Text> {service.serviceName}
        </Text>
        <Text>
          <Text strong>Specialist:</Text> {service.specialistName}
        </Text>
        <Text>
          <Text strong>Date and time:</Text> {service.dateTime}
        </Text>
      </Space>
    </Card>
  );
};
