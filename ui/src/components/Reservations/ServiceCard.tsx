import { Card, Space, Typography, Tag } from 'antd';
import { ModelsServiceDto } from '@/api/types.gen';
import dayjs from 'dayjs';

const { Text } = Typography;

interface ServiceCardProps {
  service: ModelsServiceDto;
  dateTime: string;
  duration: number;
}

export const ServiceCard = ({
  service,
  dateTime,
  duration,
}: ServiceCardProps) => {
  const calculatePrice = () => {
    if (!service.hourlyPrice) {
      return 0;
    }

    const hours = duration / 60;
    const basePrice = service.hourlyPrice * hours;
    const serviceCharge = service.serviceCharge || 0;

    return basePrice + serviceCharge;
  };

  return (
    <Card size="small" style={{ width: '100%' }}>
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text strong style={{ fontSize: 16 }}>
            {service.name}
          </Text>
          <Tag color="green">${calculatePrice().toFixed(2)}</Tag>
        </div>
        <Text>
          <Text strong>Date & Time:</Text>{' '}
          {dayjs(dateTime).format('YYYY-MM-DD HH:mm')}
        </Text>
        <Text>
          <Text strong>Duration:</Text> {duration} minutes
        </Text>
        {service.hourlyPrice && (
          <Text type="secondary">
            Rate: ${service.hourlyPrice.toFixed(2)}/hr
            {service.serviceCharge
              ? ` + $${service.serviceCharge.toFixed(2)} service charge`
              : ''}
          </Text>
        )}
      </Space>
    </Card>
  );
};
