import { ClockCircleOutlined } from '@ant-design/icons';
import { formatDateTime } from '@/utils/formatters';

type Props = {
  datePlaced?: string;
};

export const OrderCardTimestamp = ({ datePlaced }: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: '#8c8c8c',
        fontSize: 11,
      }}
    >
      <ClockCircleOutlined />
      <span>{formatDateTime(datePlaced)}</span>
    </div>
  );
};
