import { Typography } from 'antd';
import { ModelsReservationDto, ModelsServiceDto } from '@/api/types.gen';
import { formatDuration } from '@/utils/formatters';

const { Text } = Typography;

interface ReservationSummaryProps {
  reservation: ModelsReservationDto;
  service: ModelsServiceDto | undefined;
}

export const ReservationSummary = ({
  reservation,
  service,
}: ReservationSummaryProps) => {
  return (
    <div
      style={{
        background: '#fafafa',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
      }}
    >
      <Text type="secondary">Service</Text>
      <div style={{ marginBottom: 8 }}>
        <Text strong>{service?.name || 'Unknown Service'}</Text>
      </div>

      <Text type="secondary">Customer</Text>
      <div style={{ marginBottom: 8 }}>
        <Text strong>{reservation.customer || 'Walk-in'}</Text>
      </div>

      <Text type="secondary">Duration</Text>
      <div>
        <Text strong>{formatDuration(reservation.reservationLength || 0)}</Text>
      </div>
    </div>
  );
};
