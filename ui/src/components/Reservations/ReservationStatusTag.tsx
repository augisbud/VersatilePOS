import { Tag } from 'antd';
import { ConstantsReservationStatus } from '@/api/types.gen';

interface ReservationStatusTagProps {
  status?: ConstantsReservationStatus;
}

const statusConfig: Record<
  ConstantsReservationStatus,
  { color: string; label: string }
> = {
  Confirmed: { color: 'blue', label: 'Confirmed' },
  Completed: { color: 'green', label: 'Completed' },
  Cancelled: { color: 'red', label: 'Cancelled' },
  NoShow: { color: 'orange', label: 'No Show' },
};

export const ReservationStatusTag = ({ status }: ReservationStatusTagProps) => {
  if (!status) {
    return null;
  }

  const config = statusConfig[status];

  return <Tag color={config.color}>{config.label}</Tag>;
};
